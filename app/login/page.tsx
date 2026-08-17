import Link from "next/link";
import { Cat, KeyRound, Upload } from "lucide-react";

export const metadata={title:"登录与投稿"};
export default function LoginPage(){return <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl place-items-center px-4 py-12"><div className="card w-full max-w-md p-7 text-center sm:p-9"><span className="mx-auto grid size-12 place-items-center rounded-full bg-ink text-cream"><Cat/></span><h1 className="mt-5 text-2xl font-semibold">参与猫咪图鉴</h1><p className="mt-3 text-sm leading-6 text-ink/55">目前公众投稿无需登录。提交内容会进入工作人员后台，可在发现错误时联系协会补充或纠正。</p><div className="mt-7 grid gap-3"><Link href="/upload" className="btn-primary justify-center"><Upload size={17}/>发布照片或申请建档</Link><Link href="/admin/" className="btn-secondary justify-center"><KeyRound size={17}/>工作人员登录</Link></div></div></div>}
