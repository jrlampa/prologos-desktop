from fastapi import HTTPException, status

class PrologosException(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class EntityNotFoundException(PrologosException):
    def __init__(self, entity_name: str, entity_id: any):
        super().__init__(
            message=f"{entity_name} with ID {entity_id} not found",
            status_code=status.HTTP_404_NOT_FOUND
        )

class AIServiceException(PrologosException):
    def __init__(self, detail: str):
        super().__init__(
            message=f"ML Service Error: {detail}",
            status_code=status.HTTP_502_BAD_GATEWAY
        )
