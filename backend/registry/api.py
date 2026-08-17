import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from .models import Campaign, CampaignSubmission, Cat, CatApplication, TimelineEntry
from .utils import sanitize_upload

def _error(message,status=400): return JsonResponse({"ok":False,"error":message},status=status)
def _cat(cat):
    return {"id":str(cat.id),"slug":cat.slug,"name":cat.name,"aliases":[x.strip() for x in cat.aliases.replace(",","、").split("、") if x.strip()],"sex":cat.sex,"age":cat.estimated_age,"coat":cat.coat,"feature":cat.distinctive_features,"area":cat.area_public,"temperament":cat.temperament,"status":cat.status if cat.status in {"official","pending","adopted"} else "pending","health":cat.health_status,"neutered":cat.neutered,"intro":cat.intro,"image":cat.photo.url if cat.photo else "","imagePosition":"center","sightings":cat.timeline.filter(is_hidden=False).count()}

@require_GET
def health(request): return JsonResponse({"ok":True,"service":"cat-registry"})
@require_GET
def cats(request): return JsonResponse({"ok":True,"cats":[_cat(c) for c in Cat.objects.exclude(status="memorial")]})
@require_GET
def cat_detail(request,slug):
    try:return JsonResponse({"ok":True,"cat":_cat(Cat.objects.get(slug=slug))})
    except Cat.DoesNotExist:return _error("未找到猫咪",404)

@csrf_exempt
@require_POST
def create_post(request):
    try:
        entry=TimelineEntry(cat_id=request.POST.get("cat") or None,kind="sighting",title=request.POST["title"][:80],body=request.POST["body"][:2000],occurred_at=request.POST["date"],area_public=request.POST["area"][:120],author_name=request.POST.get("author_name","")[:60],author_email=request.POST.get("email","")[:254])
        if request.FILES.get("image"): entry.image=sanitize_upload(request.FILES["image"])
        entry.save(); return JsonResponse({"ok":True,"id":entry.id},status=201)
    except (KeyError,ValueError) as e:return _error(str(e))

@csrf_exempt
@require_POST
def create_application(request):
    try:
        app=CatApplication(proposed_name=request.POST["name"][:40],coat=request.POST["coat"][:100],distinctive_features=request.POST["feature"][:1000],area_public=request.POST["area"][:120],notes=request.POST.get("notes","")[:2000],contact=request.POST.get("contact","")[:120])
        if request.FILES.get("image"): app.photo=sanitize_upload(request.FILES["image"])
        app.save(); return JsonResponse({"ok":True,"id":app.id},status=201)
    except (KeyError,ValueError) as e:return _error(str(e))

@csrf_exempt
@require_POST
def create_submission(request):
    try:
        campaign=Campaign.objects.get(pk=request.POST["campaign_id"],is_published=True)
        sub=CampaignSubmission(campaign=campaign,cat_id=request.POST.get("cat") or None,title=request.POST["title"][:100],body=request.POST["body"][:5000],contact_private=request.POST["contact"][:120],consent_granted=request.POST.get("consent")=="true")
        if not sub.consent_granted:return _error("请先确认投稿授权")
        if request.FILES.get("image"): sub.image=sanitize_upload(request.FILES["image"])
        sub.save(); return JsonResponse({"ok":True,"id":sub.id},status=201)
    except Campaign.DoesNotExist:return _error("征集活动不存在或未开放",404)
    except (KeyError,ValueError) as e:return _error(str(e))
