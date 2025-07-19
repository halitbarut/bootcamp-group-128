from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    database_url: str
    api_key: str
    ai_model: str

    model_config = SettingsConfigDict(env_file=".env")
settings = Settings()