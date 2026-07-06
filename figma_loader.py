import requests, json, time, urllib.parse
from pathlib import Path

TOKEN = 'figd_6WHZniTbeirbRkV_UKBixEsM_F-cF6zkejJinK28'
FILE_KEY = '5DtKjzmoZ7JfKfO0be7MoA'
HEADERS = {'X-Figma-Token': TOKEN}

UPLOAD_DIR = Path('uploads/figma')
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

raw = json.loads(Path('figma_raw.json').read_text())
pages = raw['document']['children']
website_page = None
for p in pages:
    if 'website' in p.get('name','').lower():
        website_page = p
        break

# Collect image nodes from content sections only
image_nodes = {}

def walk(node):
    if node.get('type') in ('COMPONENT', 'COMPONENT_SET'):
        return
    fills = node.get('fills', [])
    for fill in fills:
        if fill.get('type') == 'IMAGE':
            image_nodes[node['id']] = node
            break
    for child in node.get('children', []):
        walk(child)

for section in website_page.get('children', []):
    section_name = section.get('name', '')
    if 'Components' in section_name:
        continue
    print(f'Scanning: {section_name}')
    walk(section)

print(f'\nTotal image nodes: {len(image_nodes)}')

# Fetch image URLs in batches
image_urls = {}
node_ids = list(image_nodes.keys())
batch_size = 15

for i in range(0, len(node_ids), batch_size):
    batch = node_ids[i:i+batch_size]
    ids = ','.join(batch)
    url = f'https://api.figma.com/v1/images/{FILE_KEY}?ids={urllib.parse.quote(ids)}&format=png&scale=2'
    try:
        resp = requests.get(url, headers=HEADERS, timeout=60)
        if resp.status_code == 429:
            print('  Rate limited, waiting 10s...')
            time.sleep(10)
            resp = requests.get(url, headers=HEADERS, timeout=60)
        resp.raise_for_status()
        result = resp.json()
        if 'images' in result:
            image_urls.update(result['images'])
            print(f'  Batch {i//batch_size+1}: Got {len(result["images"])} URLs')
        else:
            print(f'  Batch {i//batch_size+1}: No images - {result.get("err","unknown")}')
    except Exception as e:
        print(f'  Batch {i//batch_size+1}: Error - {e}')
    time.sleep(3)

print(f'\nTotal image URLs fetched: {len(image_urls)}')

# Download images
downloaded = {}
for idx, (node_id, url) in enumerate(image_urls.items(), 1):
    node = image_nodes[node_id]
    safe_name = node.get('name', 'image').replace(' ', '_').replace('/', '_')[:30]
    node_id_safe = node_id.replace(':', '_')
    filename = f'figma_{safe_name}_{node_id_safe}.png'
    try:
        resp = requests.get(url, timeout=60)
        resp.raise_for_status()
        filepath = UPLOAD_DIR / filename
        filepath.write_bytes(resp.content)
        downloaded[node_id] = str(filepath)
        print(f'[{idx}/{len(image_urls)}] OK {filename}')
    except Exception as e:
        print(f'[{idx}/{len(image_urls)}] FAIL {filename}')

print(f'\nDownloaded {len(downloaded)} images')

# Extract structured data
cms_data = {
    'homepage': {'hero_slides': [], 'about': {}, 'services': [], 'brands': [], 'testimonials': [], 'partners': [], 'cta_banner': {}},
    'our_story': {'hero': {}, 'mission': {}, 'values': [], 'timeline': [], 'team': [], 'awards': []},
    'our_brands': {'brands': [], 'flower_portfolio': [], 'training_centres': [], 'products': []},
    'our_gallery': {'categories': [], 'items': [], 'videos': []},
    'hiring': {'positions': [], 'benefits': [], 'testimonials': [], 'page_content': {}},
    'contact': {'info': {}, 'faqs': [], 'locations': []},
    'news': {'articles': [], 'categories': [], 'press_releases': []},
    'site_settings': {}
}

def extract_text(node):
    if node.get('type') == 'TEXT' and 'characters' in node:
        return node['characters'].strip()
    return None

def extract_images(node):
    fills = node.get('fills', [])
    for fill in fills:
        if fill.get('type') == 'IMAGE' and node['id'] in downloaded:
            return downloaded[node['id']]
    return None

for section in website_page.get('children', []):
    section_name = section.get('name', '')
    if 'Components' in section_name:
        continue
    print(f'\nExtracting from: {section_name}')
    
    if 'Homepage' in section_name:
        for child in section.get('children', []):
            child_name = child.get('name', '').lower()
            text = extract_text(child)
            img = extract_images(child)
            
            if 'hero' in child_name or 'banner' in child_name:
                if text:
                    if not cms_data['homepage']['hero_slides']:
                        cms_data['homepage']['hero_slides'].append({'title': '', 'subtitle': '', 'description': ''})
                    if len(text) < 40:
                        cms_data['homepage']['hero_slides'][0]['title'] = text
                    elif len(text) < 100:
                        cms_data['homepage']['hero_slides'][0]['subtitle'] = text
                    else:
                        cms_data['homepage']['hero_slides'][0]['description'] = text
                if img:
                    if not cms_data['homepage']['hero_slides']:
                        cms_data['homepage']['hero_slides'].append({})
                    cms_data['homepage']['hero_slides'][0]['background_image'] = img
            
            elif 'about' in child_name:
                if text:
                    if len(text) < 50:
                        cms_data['homepage']['about']['title'] = text
                    else:
                        cms_data['homepage']['about']['description'] = text
                if img:
                    cms_data['homepage']['about']['image'] = img
            
            elif 'service' in child_name or 'what we' in child_name:
                if text and len(text) > 3 and len(text) < 100:
                    cms_data['homepage']['services'].append({'title': text, 'description': ''})
            
            elif 'testimonial' in child_name:
                if text and len(text) > 10:
                    cms_data['homepage']['testimonials'].append({'quote': text, 'author': '', 'role': ''})
            
            elif 'partner' in child_name or 'client' in child_name or 'logo' in child_name:
                if img:
                    cms_data['homepage']['partners'].append({'logo': img, 'name': child.get('name', '')})
            
            elif 'cta' in child_name or 'call' in child_name:
                if text:
                    cms_data['homepage']['cta_banner']['title'] = text
                if img:
                    cms_data['homepage']['cta_banner']['background_image'] = img
    
    elif 'Our Story' in section_name:
        for child in section.get('children', []):
            child_name = child.get('name', '').lower()
            text = extract_text(child)
            img = extract_images(child)
            
            if 'mission' in child_name:
                if text:
                    cms_data['our_story']['mission']['description'] = text
            elif 'vision' in child_name:
                if text:
                    cms_data['our_story']['mission']['vision'] = text
            elif 'value' in child_name:
                if text and len(text) < 100:
                    cms_data['our_story']['values'].append({'title': text, 'description': ''})
            elif 'team' in child_name or 'member' in child_name or 'founder' in child_name:
                if text and len(text) < 80:
                    cms_data['our_story']['team'].append({'name': text, 'role': '', 'bio': ''})
                if img:
                    if cms_data['our_story']['team']:
                        cms_data['our_story']['team'][-1]['avatar'] = img
            elif 'award' in child_name:
                if text:
                    cms_data['our_story']['awards'].append({'title': text, 'year': ''})
            elif 'hero' in child_name or 'banner' in child_name:
                if img:
                    cms_data['our_story']['hero']['image'] = img
    
    elif 'Our Brands' in section_name:
        for child in section.get('children', []):
            child_name = child.get('name', '').lower()
            text = extract_text(child)
            img = extract_images(child)
            
            if text and len(text) < 100:
                if 'brand' in child_name or 'product' in child_name:
                    item = {'name': text, 'description': '', 'logo': img}
                    cms_data['our_brands']['brands'].append(item)
            
            if img:
                if 'flower' in child_name or 'portfolio' in child_name:
                    cms_data['our_brands']['flower_portfolio'].append({'title': child.get('name', ''), 'image': img})
                elif 'training' in child_name or 'course' in child_name:
                    cms_data['our_brands']['training_centres'].append({'name': child.get('name', ''), 'image': img})
    
    elif 'Our Gallery' in section_name:
        for child in section.get('children', []):
            img = extract_images(child)
            if img:
                cms_data['our_gallery']['items'].append({'title': child.get('name', ''), 'image': img, 'category': 'general'})
    
    elif 'Hiring' in section_name:
        for child in section.get('children', []):
            child_name = child.get('name', '').lower()
            text = extract_text(child)
            
            if 'position' in child_name or 'job' in child_name or 'role' in child_name:
                if text and len(text) < 100:
                    cms_data['hiring']['positions'].append({'title': text, 'department': '', 'location': '', 'description': ''})
            elif 'benefit' in child_name or 'perk' in child_name:
                if text and len(text) < 100:
                    cms_data['hiring']['benefits'].append({'title': text, 'description': ''})
            elif 'testimonial' in child_name:
                if text and len(text) > 10:
                    cms_data['hiring']['testimonials'].append({'quote': text, 'author': ''})
            elif 'title' in child_name or 'head' in child_name:
                if text and len(text) < 100:
                    cms_data['hiring']['page_content']['title'] = text
            elif 'desc' in child_name:
                if text and len(text) > 10:
                    cms_data['hiring']['page_content']['description'] = text
    
    elif 'Contact' in section_name:
        for child in section.get('children', []):
            child_name = child.get('name', '').lower()
            text = extract_text(child)
            
            if text:
                if 'email' in child_name and '@' in text:
                    cms_data['contact']['info']['email'] = text
                elif 'phone' in child_name and any(c.isdigit() for c in text):
                    cms_data['contact']['info']['phone'] = text
                elif 'address' in child_name or 'location' in child_name:
                    if len(text) > 10:
                        cms_data['contact']['locations'].append({'name': text, 'address': text})
                elif 'faq' in child_name or 'question' in child_name:
                    cms_data['contact']['faqs'].append({'question': text, 'answer': ''})
    
    elif 'News' in section_name:
        for child in section.get('children', []):
            child_name = child.get('name', '').lower()
            text = extract_text(child)
            img = extract_images(child)
            
            if text and len(text) > 10:
                if 'article' in child_name or 'news' in child_name or 'blog' in child_name:
                    article = {'title': text, 'excerpt': '', 'content': ''}
                    if img:
                        article['featured_image'] = img
                    cms_data['news']['articles'].append(article)
                elif 'press' in child_name:
                    cms_data['news']['press_releases'].append({'title': text, 'content': ''})
                elif 'category' in child_name and len(text) < 50:
                    cms_data['news']['categories'].append({'name': text, 'slug': text.lower().replace(' ', '-')})

Path('figma_data.json').write_text(json.dumps(cms_data, indent=2, default=str))
print('\n✓ Saved extracted data to figma_data.json')

print('\n=== DATA SUMMARY ===')
for section, items in cms_data.items():
    if isinstance(items, dict):
        for subkey, subval in items.items():
            if isinstance(subval, list):
                print(f'  {section}.{subkey}: {len(subval)} items')
            elif subval:
                print(f'  {section}.{subkey}: present')
