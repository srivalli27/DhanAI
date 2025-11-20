## DhanAI — Intelligent Transaction Categorisation

DhanAI is a simple AI-powered tool that automatically categorises financial
transactions such as:

- “Swiggy Order #2983”
- “Amazon INV 82493”
- “HP Petrol Pump”
- “Netflix Subscription”

The system works fully offline using a lightweight ML model.  
It reads the transaction text, predicts a category (Food, Shopping, Fuel, Bills, Subscriptions, Business, etc.), 
and provides a short explanation of why the category was chosen.

DhanAI includes:

- Local ML model (no external APIs)
- Category prediction with confidence score
- Keyword-based explainability
- Editable category list using `categories.json`
- Minimal, clean UI (HTML + JS)
- FastAPI backend for inference

You can run it locally, customise categories, retrain the model, and integrate it into any finance app.

