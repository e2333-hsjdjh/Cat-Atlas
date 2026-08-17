from django.contrib import admin
from .models import Campaign, CampaignSubmission, Cat, CatApplication, Report, TimelineEntry

@admin.register(Cat)
class CatAdmin(admin.ModelAdmin):
    list_display=("name","sex","coat","status","area_public","updated_at")
    list_filter=("status","sex","source_year")
    search_fields=("name","aliases","coat","distinctive_features")
    prepopulated_fields={"slug":("name",)}
    readonly_fields=("created_at","updated_at")

@admin.register(TimelineEntry)
class TimelineAdmin(admin.ModelAdmin):
    list_display=("title","cat","kind","occurred_at","is_featured","is_hidden")
    list_filter=("kind","is_featured","is_hidden")
    search_fields=("title","body","cat__name","author_name")
    autocomplete_fields=("cat",)

@admin.register(CatApplication)
class ApplicationAdmin(admin.ModelAdmin):
    list_display=("proposed_name","coat","area_public","status","created_at")
    list_filter=("status",)
    search_fields=("proposed_name","coat","distinctive_features","contact")

@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display=("title","starts_at","ends_at","is_published")
    list_filter=("is_published",)

@admin.register(CampaignSubmission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display=("title","campaign","cat","status","created_at")
    list_filter=("status","campaign")
    search_fields=("title","body","contact_private")

admin.site.register(Report)
