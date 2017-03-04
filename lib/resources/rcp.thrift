struct Response{
    1: required i32 statu = 200
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

service doRequest{

    void ping(),

    Response doRequest(1:Request request)

}