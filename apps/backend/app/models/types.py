"""Custom SQLAlchemy types for cross-database compatibility."""
import json
import uuid
from sqlalchemy import Text, String, TypeDecorator
from sqlalchemy.dialects.postgresql import UUID as PG_UUID


class StringList(TypeDecorator):
    """
    A list of strings stored as JSON text.
    Works with both PostgreSQL and SQLite.
    """
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return "[]"
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return []
        return json.loads(value)


class GUID(TypeDecorator):
    """
    UUID type that works with both PostgreSQL (native UUID) and SQLite (CHAR(32)).
    """
    impl = String(32)
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(String(32))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == "postgresql":
            return value
        if isinstance(value, uuid.UUID):
            return value.hex
        return value

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(value)
