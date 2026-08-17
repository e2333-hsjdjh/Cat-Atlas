#!/usr/bin/env python3
import ast
import os
import secrets
import shlex
import shutil
import stat
import subprocess
from pathlib import Path
from datetime import datetime

ROOT=Path("/www/wwwroot/cat-atlas")
BACKEND=ROOT/"backend"
EXISTING=Path("/www/wwwroot/class_info_system/class_info_system/settings.py")
NGINX=Path("/www/server/panel/vhost/nginx/class_info_system.conf")
MARKER="# ===== 猫猫图鉴（独立服务：3180 / 3181）====="

def run(*args,cwd=None,env=None):
    print("+", " ".join(map(str,args)))
    subprocess.run(args,cwd=cwd,env=env,check=True)

def read_cos():
    tree=ast.parse(EXISTING.read_text())
    for node in tree.body:
        if isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=="TENCENTCOS_STORAGE" for t in node.targets):
            value=ast.literal_eval(node.value)
            return value["BUCKET"],value["CONFIG"]["Region"],value["CONFIG"]["SecretId"],value["CONFIG"]["SecretKey"]
    raise RuntimeError("TENCENTCOS_STORAGE not found")

def write_env():
    bucket,region,secret_id,secret_key=read_cos()
    backend_env=BACKEND/".env"
    old={}
    if backend_env.exists():
        for line in backend_env.read_text().splitlines():
            if "=" in line: old[line.split("=",1)[0]]=line.split("=",1)[1]
    django_secret=old.get("CAT_SECRET_KEY") or secrets.token_urlsafe(48)
    values={"CAT_SECRET_KEY":django_secret,"CAT_ALLOWED_HOSTS":"20250821cdcdifc.top,81.68.84.74,127.0.0.1","CAT_CSRF_TRUSTED_ORIGINS":"https://20250821cdcdifc.top","CAT_COS_BUCKET":bucket,"CAT_COS_REGION":region,"CAT_COS_SECRET_ID":secret_id,"CAT_COS_SECRET_KEY":secret_key}
    backend_env.write_text("\n".join(f"{k}={shlex.quote(v)}" for k,v in values.items())+"\n")
    backend_env.chmod(0o600)
    (ROOT/".env.production").write_text("NEXT_PUBLIC_BASE_PATH=/cat\nNEXT_PUBLIC_API_MODE=django\nNEXT_PUBLIC_SITE_URL=https://20250821cdcdifc.top/cat\nCAT_API_INTERNAL_URL=http://127.0.0.1:3181/api\n")

def install_and_build():
    run("npm","ci",cwd=ROOT)
    run("python3","-m","venv",str(BACKEND/".venv"))
    run(str(BACKEND/".venv/bin/pip"),"install","--disable-pip-version-check","-r",str(BACKEND/"requirements.txt"))
    env=os.environ.copy()
    for line in (ROOT/".env.production").read_text().splitlines():
        if "=" in line:
            k,v=line.split("=",1); env[k]=v
    run("npm","run","build",cwd=ROOT,env=env)
    (BACKEND/"data").mkdir(exist_ok=True)
    run(str(BACKEND/".venv/bin/python"),"manage.py","migrate","--noinput",cwd=BACKEND,env=load_backend_env())
    run(str(BACKEND/".venv/bin/python"),"manage.py","seed_2023",cwd=BACKEND,env=load_backend_env())
    run(str(BACKEND/".venv/bin/python"),"manage.py","collectstatic","--noinput",cwd=BACKEND,env=load_backend_env())

def load_backend_env():
    env=os.environ.copy()
    for raw in (BACKEND/".env").read_text().splitlines():
        if "=" in raw:
            k,v=raw.split("=",1); env[k]=shlex.split(v)[0] if v else ""
    return env

def ensure_admin():
    credentials=Path("/root/cat-admin-credentials.txt")
    script="""from django.contrib.auth import get_user_model\nfrom pathlib import Path\nimport secrets\nU=get_user_model()\nif not U.objects.filter(username='catadmin').exists():\n p=secrets.token_urlsafe(18)\n U.objects.create_superuser('catadmin','',p)\n Path('/root/cat-admin-credentials.txt').write_text('URL: https://20250821cdcdifc.top/cat/admin/\\nUsername: catadmin\\nPassword: '+p+'\\n')\n Path('/root/cat-admin-credentials.txt').chmod(0o600)\n"""
    run(str(BACKEND/".venv/bin/python"),"manage.py","shell","-c",script,cwd=BACKEND,env=load_backend_env())
    print("Admin credentials:",credentials)

def install_services():
    for name in ("cat-atlas-api.service","cat-atlas-web.service"):
        shutil.copy2(ROOT/"deploy"/name,Path("/etc/systemd/system")/name)
    run("systemctl","daemon-reload")
    run("systemctl","enable","--now","cat-atlas-api.service","cat-atlas-web.service")

def install_nginx():
    current=NGINX.read_text()
    if MARKER not in current:
        stamp=datetime.now().strftime("%Y%m%d-%H%M%S")
        backup=NGINX.with_name(NGINX.name+f".cat-backup-{stamp}")
        shutil.copy2(NGINX,backup)
        needle="    location / {\n        proxy_pass http://127.0.0.1:8000;"
        if needle not in current: raise RuntimeError("Nginx insertion point not found")
        snippet=(ROOT/"deploy/nginx-cat-snippet.conf").read_text().rstrip()+"\n\n"
        NGINX.write_text(current.replace(needle,snippet+needle,1))
        try: run("nginx","-t")
        except Exception:
            shutil.copy2(backup,NGINX)
            raise
        run("nginx","-s","reload")
        print("Nginx backup:",backup)

if __name__=="__main__":
    write_env()
    install_and_build()
    ensure_admin()
    install_services()
    install_nginx()
    print("Deployment complete")
