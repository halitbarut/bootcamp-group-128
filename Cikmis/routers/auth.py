from fastapi import APIRouter

# crud.py daki crud işlemlerini kullanan endpointler (/add_user, /get_user, /update_user, /delete_user)
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)