import csv
import io
from datetime import datetime, timezone
from typing import BinaryIO

from .database import connection
from .models import MaskedProfile, RevealProfile
from .security import decrypt, encrypt, mask

REQUIRED_COLUMNS = {"full_name", "role", "department", "email", "phone", "national_id", "address"}


def import_csv(file: BinaryIO) -> int:
    raw = file.read()
    if len(raw) > 2_000_000:
        raise ValueError("CSV must be smaller than 2 MB")
    reader = csv.DictReader(io.StringIO(raw.decode("utf-8-sig")))
    columns = set(reader.fieldnames or [])
    missing = REQUIRED_COLUMNS - columns
    if missing:
        raise ValueError(f"Missing columns: {', '.join(sorted(missing))}")
    rows = list(reader)
    if not rows:
        raise ValueError("CSV has no profile rows")
    if len(rows) > 5000:
        raise ValueError("CSV cannot contain more than 5,000 profiles")
    with connection() as conn:
        for row in rows:
            if any(not (row.get(column) or "").strip() for column in REQUIRED_COLUMNS):
                raise ValueError("Every required field must be populated")
            conn.execute("""
                INSERT INTO profiles
                (full_name, role, department, email_encrypted, phone_encrypted,
                 national_id_encrypted, address_encrypted, imported_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                row["full_name"].strip(), row["role"].strip(), row["department"].strip(),
                encrypt(row["email"].strip()), encrypt(row["phone"].strip()),
                encrypt(row["national_id"].strip()), encrypt(row["address"].strip()),
                datetime.now(timezone.utc).isoformat(),
            ))
    return len(rows)


def list_profiles() -> list[MaskedProfile]:
    with connection() as conn:
        rows = conn.execute("SELECT * FROM profiles ORDER BY id DESC").fetchall()
    return [MaskedProfile(
        id=row["id"], full_name=row["full_name"], role=row["role"], department=row["department"],
        email=mask(decrypt(row["email_encrypted"])), phone=mask(decrypt(row["phone_encrypted"])),
        national_id=mask(decrypt(row["national_id_encrypted"])), address=mask(decrypt(row["address_encrypted"])),
        imported_at=row["imported_at"],
    ) for row in rows]


def reveal_profile(profile_id: int) -> RevealProfile:
    with connection() as conn:
        row = conn.execute("SELECT * FROM profiles WHERE id = ?", (profile_id,)).fetchone()
    if row is None:
        raise KeyError("Profile not found")
    return RevealProfile(
        id=row["id"], full_name=row["full_name"], role=row["role"], department=row["department"],
        email=decrypt(row["email_encrypted"]), phone=decrypt(row["phone_encrypted"]),
        national_id=decrypt(row["national_id_encrypted"]), address=decrypt(row["address_encrypted"]),
    )
