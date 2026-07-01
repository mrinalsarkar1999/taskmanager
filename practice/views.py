import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from .models import Task
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import update_session_auth_hash # Needed to keep user logged in after password change

@csrf_exempt
def register_user(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        email = data.get('email', '')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({"message": "Username already exists"}, status=400)
            
        user = User.objects.create_user(
            username=username, 
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        login(request, user)
        return JsonResponse({"message": "Registration successful"})

@csrf_exempt
def profile_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    
    if request.method == "GET":
        return JsonResponse({
            "username": request.user.username,
            "email": request.user.email,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
        })
    
    elif request.method == "PUT":
        data = json.loads(request.body)
        request.user.first_name = data.get('first_name', request.user.first_name)
        request.user.last_name = data.get('last_name', request.user.last_name)
        request.user.email = data.get('email', request.user.email)
        request.user.save()
        return JsonResponse({"message": "Profile updated successfully"})

@csrf_exempt
def change_password(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    
    if request.method == "PUT":
        data = json.loads(request.body)
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        
        if not request.user.check_password(old_password):
            return JsonResponse({"message": "Incorrect current password"}, status=400)
            
        request.user.set_password(new_password)
        request.user.save()
        # Keep the user logged in after their password hash changes
        update_session_auth_hash(request, request.user)
        return JsonResponse({"message": "Password updated successfully"})
    

# Tells django even if you do not receive any csrf token, Allow the request
@csrf_exempt
def test(request):
    # json.loads - It converts the Json object into a python dictionary
    data = json.loads(request.body)
    email = data.get('username')
    passwrd = data.get('password')
    user = authenticate(request,username=email,password=passwrd)
    if user is not None:
        login(request,user)
        return JsonResponse({"message":"Login succesful"})
    else:
        return JsonResponse({"message":"Invalid credentials"})

@csrf_exempt
def logout_handle(request):
    logout(request)
    return JsonResponse({"message":"Logout succesful"})


@csrf_exempt
def checkAuth(request):
    return JsonResponse({"message":request.user.is_authenticated})

@csrf_exempt
def task_list_create(request):
    # Check if the user is actually logged in via the session cookie
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    if request.method == "GET":
        # Fetch tasks that belong only to this user
        tasks = Task.objects.filter(user=request.user).values(
            'id', 'title', 'is_completed', 'created_at'
        )
        return JsonResponse(list(tasks), safe=False)

    elif request.method == "POST":
        # Create a new task
        data = json.loads(request.body)
        title = data.get('title')
        
        task = Task.objects.create(
            user=request.user,
            title=title,
        )
        return JsonResponse({
            "message": "Task created", 
            "task": {"id": task.id, "title": task.title, "is_completed": task.is_completed}
        })
    

@csrf_exempt
def task_detail(request, task_id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    task = get_object_or_404(Task, id=task_id, user=request.user)

    if request.method == "PUT":
        data = json.loads(request.body)
        
        task.title = data.get('title', task.title)
        
        if 'is_completed' in data:
            task.is_completed = data['is_completed']
            
        task.save()
        return JsonResponse({
            "message": "Task updated", 
            "task": {"id": task.id, "title": task.title, "is_completed": task.is_completed}
        })

    elif request.method == "DELETE":
        task.delete()
        return JsonResponse({"message": "Task deleted"})