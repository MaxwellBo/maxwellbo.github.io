from dataclasses import dataclass

@dataclass
class SchemaVersion(object):
  services: List[Service]

@dataclass
class Service(object):
  name: str
  methods: List[Method]


@dataclass
class Method(object):
  name: str
  request: Message
  response: Message


@dataclass
class Message(object):
  name: str
  fields: List[Field]


@dataclass
class Field(object):
  name: str
  type: Type
  label: str
  id_number: int

@dataclass
class Type(object):
  name: str
  kind: str

@dataclass
class Enum(object):
  name: str
  values: List[EnumValue]

@dataclass
class EnumValue(object):
  name: str
  value: int

def check_proposal(
  client_schema_versions: List[SchemaVersion], 
  server_schema_versions: List[SchemaVersion],
  proposed_schema_version: SchemaVersion):

  for client_schema_version in client_schema_versions:
    check_schema(
      client_schema_version=client_schema_version,
      server_schema_version=proposed_schema_version
    )

  for server_schema_version in server_schema_versions:
    check_schema(
      client_schema_version=proposed_schema_version,
      server_schema_version=server_schema_version)


def check_schema(client_schema_version: SchemaVersion, server_schema_version: SchemaVersion):
  pass


def check_method(client_method: Method, server_method: Method):
  check_message(producer_message=client_method.request, consumer_message=server_method.request)
  check_message(producer_message=server_method.response, consumer_message=client_method.response)

def check_message(producer_message: Message, consumer_message: Message):
  pass


def check_field(producer_field: Optional[Field], consumer_field: Optional[Field]):
  pass



