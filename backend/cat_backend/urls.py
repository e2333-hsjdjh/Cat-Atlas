from django.contrib import admin
from django.urls import include, path
urlpatterns = [path("admin/", admin.site.urls), path("api/", include("registry.urls"))]
admin.site.site_header = "猫猫图鉴 · 工作人员后台"
admin.site.site_title = "猫猫图鉴后台"
admin.site.index_title = "档案与动态管理"
