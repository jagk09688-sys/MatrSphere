from dataclasses import dataclass
from typing import Optional


@dataclass
class UserProfile:
    id: int
    full_name: str
    role: str
    department: str
    email: str
    phone: str
    national_id: str
    address: str
    imported_at: str


@dataclass
class MaskedProfile:
    id: int
    full_name: str
    role: str
    department: str
    email: str
    phone: str
    national_id: str
    address: str
    imported_at: str


@dataclass
class RevealProfile:
    id: int
    full_name: str
    role: str
    department: str
    email: str
    phone: str
    national_id: str
    address: str
