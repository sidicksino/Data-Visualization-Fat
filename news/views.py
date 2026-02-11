from django.shortcuts import render
from django.conf import settings
import requests

def index(request):
    api_key = settings.NEWSDATA_API_KEY
    base_url = "https://newsdata.io/api/1/news"
    
    # Get parameters
    country = request.GET.get('country', 'us')  # Default to US
    category = request.GET.get('category', 'all')
    
    # Build query parameters
    params = {
        'apikey': api_key,
        'language': 'en',
    }
    
    if country and country != 'all':
        params['country'] = country
        
    if category and category != 'all':
        params['category'] = category

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        data = response.json()
        articles = data.get('results', [])
        error = None
    except requests.RequestException as e:
        articles = []
        error = str(e)

    context = {
        'articles': articles,
        'selected_country': country,
        'selected_category': category,
        'error': error,
    }
    return render(request, 'news/index.html', context)
