# 🧾 Family Grocery List - MVP Spec

## 🧩 1. Core Features
- ✅ View grocery list (shared by all)
- ➕ Add new item (name only)
- ❌ Delete item
- ✔️ Mark item as “Bought” (strike-through or move to “Bought” section)

## 🧑‍🤝‍🧑 2. Users
- No login for MVP (just one shared list for the family)
- Optional: Add basic name tag when submitting an item (e.g., "Milk (added by Mum)")

## 🧱 3. Tech Stack
- **Frontend:** HTML, CSS, JS (or React for convenience)
- **Backend:** Django (with REST API views)
- **Database:** SQLite
- **Hosting:** Localhost only (or deploy on Render for free)

## 📄 4. Data Model
```python
# grocery/models.py
class Item(models.Model):
    name = models.CharField(max_length=100)
    added_at = models.DateTimeField(auto_now_add=True)
    bought = models.BooleanField(default=False)
```

## 🖥️ 5. Frontend Pages
- **/** – Home page with:
  - List of items
  - Add item form
  - “Mark as bought” and “Delete” buttons

## 🚀 6. Stretch Goals (after MVP)
- Add timestamps
- Filter: Show only unbought items
- Make it mobile-responsive
- Add user names (just a text field for now)
- Deploy online