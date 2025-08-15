# SUGERENCIA: Actualiza tu modelo Card en el backend así:

class Card(db.Model):
    __tablename__="cards"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    responsable_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    creation_date = db.Column(db.DateTime, nullable=False)
    begin_date = db.Column(db.DateTime, nullable=True)
    due_date = db.Column(db.DateTime, nullable=True)
    state = db.Column(db.Enum(State), nullable=False, default=State.TODO) 
    board_id = db.Column(db.Integer, db.ForeignKey("boards.id"), nullable=False)
    
    # NUEVOS CAMPOS:
    priority = db.Column(db.String(10), nullable=True)  # 'Baja', 'Media', 'Alta'
    tags = db.Column(db.JSON, nullable=True)  # Lista de etiquetas como JSON
   
    members = db.relationship('User', secondary='card_user_association', backref='cards')

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "responsableId": self.responsable_id,
            "creationDate": self.creation_date.isoformat(),
            "beginDate": self.begin_date.isoformat() if self.begin_date else None,
            "dueDate": self.due_date.isoformat() if self.due_date else None,
            "state": self.state.value,
            "boardId": self.board_id,
            "priority": self.priority,  # NUEVO
            "tags": self.tags or [],    # NUEVO
            "members": [member.serialize() for member in self.members]
        }

# Después de actualizar el modelo, ejecuta:
# python -c "from app.main import app, db; app.app_context().push(); db.create_all()"