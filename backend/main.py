from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import auth, categories, products, dashboard, reports
from database.connection import close_database
from database.seed import seed_admin_user

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize all services
    await auth.auth_service.initialize()
    await categories.category_service.initialize()
    await products.product_service.initialize()
    await dashboard.dashboard_service.initialize()
    await reports.report_service.initialize()
    # Seed admin user
    await seed_admin_user()
    yield
    await close_database()

app = FastAPI(title="Product Management API", version="1.0.0", lifespan=lifespan)

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
