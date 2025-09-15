from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.pdf_routes import router as pdf_router

app = FastAPI()

# Add CORS middleware to allow requests from localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(pdf_router)

@app.get("/")
def root():
    return {"message": "Backend running"}
