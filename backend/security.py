import os
from cryptography.fernet import Fernet


_KEY = os.getenv("PII_ENCRYPTION_KEY")
if not _KEY:
    _KEY = Fernet.generate_key().decode()
    print("WARNING: Using an ephemeral PII key. Set PII_ENCRYPTION_KEY in production.")

cipher = Fernet(_KEY.encode())


def encrypt(value: str) -> bytes:
    return cipher.encrypt(value.encode("utf-8"))


def decrypt(value: bytes) -> str:
    return cipher.decrypt(value).decode("utf-8")


def mask(value: str, visible: int = 4) -> str:
    if len(value) <= visible:
        return "•" * len(value)
    return "•" * max(4, len(value) - visible) + value[-visible:]
