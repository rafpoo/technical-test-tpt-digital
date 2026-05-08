from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import auth, categories, products, dashboard, reports
from database.connection import close_database

load_dotenv()

app = FastAPI(title="Product Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(products.router)
app.include_router(dashboard.router)
app.include_router(reports.router)

@app.get("/")
async def root():
    return {"message": "Product Management API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.on_event("shutdown")
async def shutdown_event():
    await close_database()