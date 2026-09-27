from dataclasses import asdict
from fastapi import APIRouter, File, HTTPException, UploadFile

from .services import import_csv, list_profiles, reveal_profile

router = APIRouter(prefix="/api")


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/profiles")
def profiles() -> dict:
    return {"profiles": [asdict(profile) for profile in list_profiles()]}


@router.post("/profiles/import")
def upload_profiles(file: UploadFile = File(...)) -> dict:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file")
    try:
        count = import_csv(file.file)
    except (UnicodeDecodeError, ValueError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return {"imported": count}


@router.post("/profiles/{profile_id}/reveal")
def reveal(profile_id: int) -> dict:
    try:
        return {"profile": asdict(reveal_profile(profile_id))}
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
