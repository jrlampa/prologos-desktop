from sqlalchemy import Column, Integer, String, Text, ForeignKey, Date, DateTime, Boolean
from sqlalchemy.orm import relationship
import datetime
from backend.core.database import Base

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True) # e.g., 'tribunal-justica-sp'
    name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    users = relationship("User", back_populates="organization")
    api_keys = relationship("APIKey", back_populates="organization")
    audit_logs = relationship("AuditLog", back_populates="organization")
    tribunais = relationship("Tribunal", back_populates="organization")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_ip = Column(String)
    user_agent = Column(String, nullable=True)
    request_id = Column(String, nullable=True)
    action = Column(String)
    resource = Column(String)
    details = Column(Text, nullable=True)
    
    organization = relationship("Organization", back_populates="audit_logs")

class AuditLogArchive(Base):
    __tablename__ = "audit_logs_archive"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True, index=True)
    archived_at = Column(DateTime, default=datetime.datetime.utcnow)
    original_id = Column(Integer)
    timestamp = Column(DateTime)
    user_ip = Column(String)
    user_agent = Column(String, nullable=True)
    request_id = Column(String, nullable=True)
    action = Column(String)
    resource = Column(String)
    details = Column(Text, nullable=True)

class WebhookSubscription(Base):
    __tablename__ = "webhook_subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True, index=True)
    url = Column(String, nullable=False)
    event_type = Column(String, index=True) # e.g., 'dossier.generated'
    secret = Column(String) # For HMAC signing
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="analyst") # analyst, auditor, manager, admin
    is_active = Column(Integer, default=1)
    
    organization = relationship("Organization", back_populates="users")
    api_keys = relationship("APIKey", back_populates="user")

class APIKey(Base):
    __tablename__ = "api_keys"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    tier = Column(String, default="standard") # standard, priority, industrial
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    organization = relationship("Organization", back_populates="api_keys")
    user = relationship("User", back_populates="api_keys")

class Tribunal(Base):
    __tablename__ = "tribunais"
    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True, index=True)
    nome = Column(String, unique=True, index=True)
    estado = Column(String)
    
    organization = relationship("Organization", back_populates="tribunais")
    juizes = relationship("Juiz", back_populates="tribunal")

class Juiz(Base):
    __tablename__ = "juizes"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    vara = Column(String)
    tribunal_id = Column(Integer, ForeignKey("tribunais.id"))
    tribunal = relationship("Tribunal", back_populates="juizes")
    decisoes = relationship("Decisao", back_populates="juiz")

class Decisao(Base):
    __tablename__ = "decisoes"
    id = Column(Integer, primary_key=True, index=True)
    numero_processo = Column(String, unique=True, index=True)
    texto_decisao = Column(Text)
    resultado = Column(String)
    tema = Column(String)
    data_decisao = Column(Date)
    juiz_id = Column(Integer, ForeignKey("juizes.id"))
    juiz = relationship("Juiz", back_populates="decisoes")
