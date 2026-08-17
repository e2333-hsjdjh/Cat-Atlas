from datetime import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from registry.models import Campaign, Cat

CATS = [
 ("10000000-0000-4000-8000-000000000001","白手套","baishoutao","公猫","狸花白胸","白胸口和四只白爪，圆眼睛","粘人、亲人、活泼","人气很高的活泼小狸花，最大的辨认特点是胸前与爪子的白色花纹。","official"),
 ("10000000-0000-4000-8000-000000000002","海盗","haidao","公猫","黑白奶牛","半边黑脸，鼻下有黑色小胡子","胆小、温顺","长着极有辨识度的黑白脸谱，虽然看起来很威风，其实性格胆小又温顺。","official"),
 ("10000000-0000-4000-8000-000000000003","沙糖橘","shatangju","母猫","浅橘白","浅橘色头顶与尾巴，身体大面积白色","特别温顺、很乖、粘人","性格特别温顺，很乖也很粘人，是图鉴里写着任人摸摸的小姑娘。","official"),
 ("10000000-0000-4000-8000-000000000004","红糖","hongtang","未知","狸花","蓝绿色眼睛，额头有清晰虎斑","亲人、温顺、喜欢贴贴","见人就蹭，喜欢一边贴贴一边喵喵，是很会表达亲近的猫咪。","official"),
 ("10000000-0000-4000-8000-000000000005","小李华","xiaolihua","母猫","深色狸花","深色虎斑，体型圆润","胆小怕生，熟悉后很粘人","刚认识时胆小怕生，熟悉后非常粘人，也是聪敏的爬树大王。","official"),
 ("10000000-0000-4000-8000-000000000006","花花","huahua","母猫","三花","头顶橘黑拼色，身体大面积白色","温顺、胆小、貌美","安静温顺的小三花，胆子不大，图鉴给她的关键词是貌美。","official"),
 ("10000000-0000-4000-8000-000000000007","大橘","daju","公猫","橘色虎斑","通体橘色，体型修长","胆小怕人","被大家称作腼腆的美男咪，请远远观察。","official"),
 ("10000000-0000-4000-8000-000000000008","小橘","xiaoju","未知","橘色虎斑","圆脸、琥珀色眼睛","胆小、爱喵喵","2023 图鉴中的小橘，近期资料仍待大家补充和确认。","pending"),
 ("10000000-0000-4000-8000-000000000009","八嘎","baga","未知","黑白狸花","鼻头两侧深色花纹不对称","超级温顺，偶尔高冷","宇宙超级无敌温顺，怎么摸都不反抗，但也会偶尔保持一点高冷。","official"),
 ("10000000-0000-4000-8000-000000000010","八公","bagong","公猫","橘白","橘色头顶与背部，白色胸腹","偏外向、喜欢无差别亲人","性格偏外向，喜欢无差别亲人，现已被领养。","adopted"),
]

class Command(BaseCommand):
    help = "录入 2023 图鉴基础档案与首批征集活动"
    def handle(self,*args,**options):
        for pk,name,slug,sex,coat,feature,temperament,intro,status in CATS:
            Cat.objects.update_or_create(id=pk,defaults={"name":name,"slug":slug,"sex":sex,"estimated_age":"2023 年已收录","coat":coat,"distinctive_features":feature,"area_public":"校园内","temperament":temperament,"health_status":"待更新" if status!="adopted" else "已被领养","intro":intro,"status":status,"source_year":2023})
        tz=timezone.get_current_timezone()
        campaigns=[("20000000-0000-4000-8000-000000000001","征集：补全 2023 图鉴猫咪近况","如果你最近遇见图鉴里的老朋友，欢迎提交照片与大致时间。",datetime(2026,8,1,tzinfo=tz),datetime(2026,9,15,23,59,tzinfo=tz)),("20000000-0000-4000-8000-000000000002","征集：新猫建档线索","发现图鉴里没有的猫咪？提交花色、显著特征和照片。",datetime(2026,8,1,tzinfo=tz),datetime(2027,12,31,23,59,tzinfo=tz))]
        for pk,title,summary,start,end in campaigns: Campaign.objects.update_or_create(id=pk,defaults={"title":title,"summary":summary,"starts_at":start,"ends_at":end,"is_published":True})
        self.stdout.write(self.style.SUCCESS(f"已同步 {len(CATS)} 只猫咪和 {len(campaigns)} 个征集"))
