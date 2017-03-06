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

struct HandShake{
    1: required string host
    2: required string port
    3: required string sha
    4: required string sign
}

exception IException{
    1: required i32 status = 404
    2: required string message
    3: optional string stack
}

exception HandShakeException{
    1: required string message
}

service doRequest{

    void ping(),
    //请求
    Response doRequest(1:Request request) throws(1:IException ex)
    //握手
    HandShake doHandShake(1:HandShake handShake) throws(1:HandShakeException ex)

}