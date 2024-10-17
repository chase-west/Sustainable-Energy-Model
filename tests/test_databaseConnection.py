import pytest
from unittest.mock import patch, MagicMock
from data_creation.dataPrediction import connect_to_mongodb

@patch('data_creation.dataPrediction.MongoClient')
def test_connect_to_mongodb(mock_mongo_client):
    
    # Create a mock MongoClient instance
    mock_client = MagicMock()
    mock_mongo_client.return_value = mock_client
    
    collection = connect_to_mongodb()
    
    assert mock_mongo_client.called  
    assert mock_client['mydatabase']['renewable_electricity'] == collection  
