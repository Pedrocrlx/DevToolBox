"""HTTP API for DevToolBox."""

import os
import string
from typing import Self

from fastapi import FastAPI, Response
from pydantic import BaseModel, ConfigDict, Field, model_validator

from commands.password import generate_password

enable_docs = os.getenv("ENABLE_DOCS", "true").lower() == "true"
app = FastAPI(
    title="DevToolBox API",
    version="0.1.0",
    docs_url="/docs" if enable_docs else None,
    redoc_url="/redoc" if enable_docs else None,
    openapi_url="/openapi.json" if enable_docs else None,
)


class PasswordRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)

    length: int = Field(default=16, ge=1, le=128)
    digits: bool = True
    letters: bool = True
    punctuation: bool = True

    @model_validator(mode="after")
    def validate_options(self) -> Self:
        selected = sum((self.digits, self.letters, self.punctuation))
        if not selected:
            raise ValueError("Select at least one character type.")
        return self


class PasswordResponse(BaseModel):
    password: str


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/passwords/generate", response_model=PasswordResponse)
def create_password(options: PasswordRequest, response: Response) -> PasswordResponse:
    response.headers["Cache-Control"] = "no-store"
    return PasswordResponse(
        password=generate_password(
            options.length,
            string.digits if options.digits else "",
            string.ascii_letters if options.letters else "",
            string.punctuation if options.punctuation else "",
        )
    )
