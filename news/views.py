from django.shortcuts import render
from django.conf import settings
import requests

def index(request):
    api_key = settings.NEWSDATA_API_KEY
    url = f"https://newsdata.io/api/1/news?apikey={api_key}&language=en"
    response = requests.get(url)
    data = response.json()
    articles = data.get('results', [])
    return render(request, 'news/index.html', {'articles': articles})
