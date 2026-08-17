import uuid
from django.db import models

class Cat(models.Model):
    STATUS = [("official","正式档案"),("pending","待确认"),("adopted","已领养"),("missing","待寻找"),("memorial","纪念")]
    SEX = [("公猫","公猫"),("母猫","母猫"),("未知","未知")]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField("名字", max_length=40)
    slug = models.SlugField("网址标识", unique=True)
    aliases = models.CharField("别名", max_length=120, blank=True, help_text="多个别名用顿号分隔")
    sex = models.CharField("性别", max_length=8, choices=SEX, default="未知")
    estimated_age = models.CharField("年龄/收录时间", max_length=60, blank=True)
    coat = models.CharField("花色", max_length=100)
    distinctive_features = models.TextField("辨认特征")
    area_public = models.CharField("公开活动区域", max_length=120, default="校园内")
    temperament = models.CharField("性格", max_length=160, blank=True)
    health_status = models.CharField("健康状态", max_length=160, blank=True)
    neutered = models.BooleanField("已绝育", null=True, blank=True)
    intro = models.TextField("简介", blank=True)
    photo = models.ImageField("档案照片", upload_to="cat/photos/%Y/%m/", blank=True)
    status = models.CharField("档案状态", max_length=20, choices=STATUS, default="official")
    source_year = models.PositiveSmallIntegerField("来源年份", default=2023)
    created_at = models.DateTimeField("创建时间", auto_now_add=True)
    updated_at = models.DateTimeField("更新时间", auto_now=True)
    class Meta: ordering=["name"]; verbose_name="猫咪档案"; verbose_name_plural="猫咪档案"
    def __str__(self): return self.name

class TimelineEntry(models.Model):
    KIND = [("sighting","目击"),("update","近况"),("story","故事"),("health","健康")]
    cat = models.ForeignKey(Cat, verbose_name="猫咪", null=True, blank=True, on_delete=models.SET_NULL, related_name="timeline")
    kind = models.CharField("类型", max_length=20, choices=KIND, default="sighting")
    title = models.CharField("标题", max_length=80)
    body = models.TextField("内容")
    occurred_at = models.DateField("发生日期")
    area_public = models.CharField("公开区域", max_length=120)
    image = models.ImageField("照片", upload_to="cat/timeline/%Y/%m/", blank=True)
    author_name = models.CharField("记录者", max_length=60, blank=True)
    author_email = models.EmailField("联系邮箱（不公开）", blank=True)
    is_featured = models.BooleanField("精选故事", default=False)
    is_hidden = models.BooleanField("已下架", default=False)
    created_at = models.DateTimeField("提交时间", auto_now_add=True)
    class Meta: ordering=["-occurred_at","-created_at"]; verbose_name="时间线记录"; verbose_name_plural="时间线记录"
    def __str__(self): return self.title

class CatApplication(models.Model):
    STATUS=[("pending","待确认"),("approved","已通过"),("merged","已合并"),("rejected","已驳回")]
    proposed_name=models.CharField("暂定名字",max_length=40)
    coat=models.CharField("花色",max_length=100)
    distinctive_features=models.TextField("辨认特征")
    area_public=models.CharField("公开区域",max_length=120)
    notes=models.TextField("其他线索",blank=True)
    photo=models.ImageField("照片",upload_to="cat/applications/%Y/%m/",blank=True)
    contact=models.CharField("联系方式（不公开）",max_length=120,blank=True)
    status=models.CharField("处理状态",max_length=20,choices=STATUS,default="pending")
    created_at=models.DateTimeField("提交时间",auto_now_add=True)
    class Meta: ordering=["-created_at"]; verbose_name="新猫建档申请"; verbose_name_plural="新猫建档申请"
    def __str__(self): return self.proposed_name

class Campaign(models.Model):
    id=models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    title=models.CharField("征集标题",max_length=100)
    summary=models.TextField("说明")
    starts_at=models.DateTimeField("开始时间")
    ends_at=models.DateTimeField("截止时间")
    is_published=models.BooleanField("公开展示",default=False)
    created_at=models.DateTimeField("创建时间",auto_now_add=True)
    class Meta: ordering=["-starts_at"]; verbose_name="征集活动"; verbose_name_plural="征集活动"
    def __str__(self): return self.title

class CampaignSubmission(models.Model):
    STATUS=[("pending","待处理"),("approved","已采用"),("rejected","未采用")]
    campaign=models.ForeignKey(Campaign,verbose_name="征集活动",on_delete=models.CASCADE,related_name="submissions")
    cat=models.ForeignKey(Cat,verbose_name="关联猫咪",null=True,blank=True,on_delete=models.SET_NULL)
    title=models.CharField("投稿标题",max_length=100)
    body=models.TextField("投稿内容")
    image=models.ImageField("投稿图片",upload_to="cat/campaigns/%Y/%m/",blank=True)
    contact_private=models.CharField("联系方式（不公开）",max_length=120)
    consent_granted=models.BooleanField("已授权展示",default=False)
    status=models.CharField("处理状态",max_length=20,choices=STATUS,default="pending")
    created_at=models.DateTimeField("提交时间",auto_now_add=True)
    class Meta: ordering=["-created_at"]; verbose_name="征集投稿"; verbose_name_plural="征集投稿"
    def __str__(self): return self.title

class Report(models.Model):
    STATUS=[("pending","待处理"),("resolved","已处理"),("dismissed","已忽略")]
    entry=models.ForeignKey(TimelineEntry,verbose_name="被举报内容",on_delete=models.CASCADE)
    reason=models.CharField("原因",max_length=120)
    detail=models.TextField("说明",blank=True)
    contact=models.CharField("联系方式（不公开）",max_length=120,blank=True)
    status=models.CharField("状态",max_length=20,choices=STATUS,default="pending")
    created_at=models.DateTimeField("举报时间",auto_now_add=True)
    class Meta: ordering=["-created_at"]; verbose_name="内容举报"; verbose_name_plural="内容举报"
    def __str__(self): return self.reason
