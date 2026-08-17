from django.urls import path
from . import api
urlpatterns=[path("health/",api.health),path("cats/",api.cats),path("cats/<slug:slug>/",api.cat_detail),path("posts/",api.create_post),path("applications/",api.create_application),path("submissions/",api.create_submission)]
