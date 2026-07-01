from django.urls import path
from . import views

urlpatterns = [
    path('',views.test,name='test'),
    path('logout/',views.logout_handle,name='logout'),
    path('check-auth/',views.checkAuth,name='cheak-auth'),
    path('api/tasks/', views.task_list_create, name='tasks'),
    path('api/tasks/<int:task_id>/', views.task_detail, name='task_detail'),
    path('api/register/', views.register_user, name='register'),
    path('api/profile/', views.profile_view, name='profile'),
    path('api/change-password/', views.change_password, name='change_password'),
]