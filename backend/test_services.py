import io
import os
import tempfile
import unittest

from backend import database
from backend.services import import_csv, list_profiles, reveal_profile


class ProfileSecurityTests(unittest.TestCase):
    def setUp(self):
        self.db_file = tempfile.NamedTemporaryFile(delete=False)
        self.db_file.close()
        database.DB_PATH = database.Path(self.db_file.name)
        database.init_db()

    def tearDown(self):
        os.unlink(self.db_file.name)

    def test_list_is_masked_but_reveal_is_cleartext(self):
        import_csv(io.BytesIO(b"full_name,role,department,email,phone,national_id,address\nA Test,Engineer,IT,a@example.com,555-1234,ID-1234,1 Main St\n"))
        masked = list_profiles()[0]
        self.assertNotEqual(masked.email, "a@example.com")
        self.assertTrue(masked.email.endswith(".com"))
        revealed = reveal_profile(masked.id)
        self.assertEqual(revealed.email, "a@example.com")


if __name__ == "__main__":
    unittest.main()
