struct Response{
    1: required i32 status = 200
    2: required string result
    3: optional string ext
}

struct Request{
    1: required string method
    2: required string uri
    3: optional string query
    4: optional string body
    5: optional string ext
}

exception IException{
    1: required i32 status = 404
    2: required string message
    3: optional string stack
}

service doRequest{

    void ping(),

    Response doRequest(1:Request request) throws(1:IException ex)

}