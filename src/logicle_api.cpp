#include "logicle_api.h"
#include <node.h>
#include <uv.h>
#include <nan.h>
#include <cstring>
#include <vector>
#include "transform_functions.h"
using namespace Nan;
using namespace v8;
using namespace std;


std::string getStringFromObj(const Local<Object> obj, const char *name)
{
	Local<String> item = Nan::New<String>(name).ToLocalChecked();
	Local<Value> value = obj->Get(Nan::GetCurrentContext(), item).ToLocalChecked();
	return *(Nan::Utf8String(value));
}

int getIntFromObj(const Local<Object> obj, const char *name)
{
	Local<String> item = Nan::New<String>(name).ToLocalChecked();
	Local<Value> value = obj->Get(Nan::GetCurrentContext(), item).ToLocalChecked();
	return value->Int32Value(Nan::GetCurrentContext()).FromJust();
}

double getDoubleFromObj(const Local<Object> obj, const char *name)
{
	Local<String> item = Nan::New<String>(name).ToLocalChecked();
	Local<Value> value = obj->Get(Nan::GetCurrentContext(), item).ToLocalChecked();
	return value->NumberValue(Nan::GetCurrentContext()).FromJust();
}

vector<double> getDoubleArrayFromObj(const Local<Object> obj, const char *name)
{
	Local<String> item = Nan::New<String>(name).ToLocalChecked();
	Local<v8::Array> array = Local<v8::Array>::Cast(obj->Get(Nan::GetCurrentContext(), item).ToLocalChecked());
	int length = array->Get(Nan::New<String>("length").ToLocalChecked())->Int32Value(Nan::GetCurrentContext()).FromJust();
	vector<double> res(length);
	for (int i = 0; i < length; ++i) {
		Local<Value> value = array->Get(i);
		res[i] = value->NumberValue(Nan::GetCurrentContext()).FromJust();
	}
	return res;
}

std::string getArgvString(const Local<Value> &argv)
{
	return *(Nan::Utf8String(Nan::To<String>(argv).ToLocalChecked()));
}

int32_t getArgvNumber(const Local<Value> &argv)
{
	return argv->Int32Value(Nan::GetCurrentContext()).FromJust();
}

NAN_METHOD(api_logicle_transform)
{
	Local<Object> obj = info[0]->ToObject(Nan::GetCurrentContext())
						.ToLocalChecked();
	vector<double> x = getDoubleArrayFromObj(obj, "x");
	double T = getDoubleFromObj(obj, "T");
	double M = getDoubleFromObj(obj, "M");
	double A = getDoubleFromObj(obj, "A");
	double W = getDoubleFromObj(obj, "W");
	int inverse = getIntFromObj(obj, "inverse");
	vector<double> res;
	try {
		res = logicle_transform(x, T, W, M, A, inverse);
	}
	catch (const char *err) {
		Local<String> err_string = Nan::New<String>(err).ToLocalChecked();
		info.GetReturnValue().Set(err_string);
		return;
	}
	Local<v8::Array> array = New<v8::Array>(res.size());
	for (unsigned long int i = 0; i < res.size(); ++i)
		Nan::Set(array, i, Nan::New(res[i]));
	info.GetReturnValue().Set(array);
}

NAN_METHOD(api_hyperlog_transform)
{
	Local<Object> obj = info[0]->ToObject(Nan::GetCurrentContext())
						.ToLocalChecked();
	vector<double> x = getDoubleArrayFromObj(obj, "x");
	double T = getDoubleFromObj(obj, "T");
	double M = getDoubleFromObj(obj, "M");
	double A = getDoubleFromObj(obj, "A");
	double W = getDoubleFromObj(obj, "W");
	int inverse = getIntFromObj(obj, "inverse");
	vector<double> res;
	try {
		res = hyperlog_transform(x, T, W, M, A, inverse);
	}
	catch (const char *err) {
		Local<String> err_string = Nan::New<String>(err).ToLocalChecked();
		info.GetReturnValue().Set(err_string);
		return;
	}
	Local<v8::Array> array = New<v8::Array>(res.size());
	for (unsigned long int i = 0; i < res.size(); ++i)
		Nan::Set(array, i, Nan::New(res[i]));
	info.GetReturnValue().Set(array);
}

NAN_METHOD(api_fast_logicle_transform)
{
	Local<Object> obj = info[0]->ToObject(Nan::GetCurrentContext())
						.ToLocalChecked();
	vector<double> x = getDoubleArrayFromObj(obj, "x");
	double T = getDoubleFromObj(obj, "T");
	double M = getDoubleFromObj(obj, "M");
	double A = getDoubleFromObj(obj, "A");
	double W = getDoubleFromObj(obj, "W");
	int inverse = getIntFromObj(obj, "inverse");
	vector<double> res;
	try {
		res = fastlogicle_transform(x, T, W, M, A, inverse);
	}
	catch (const char *err) {
		Local<String> err_string = Nan::New<String>(err).ToLocalChecked();
		info.GetReturnValue().Set(err_string);
		return;
	}
	Local<v8::Array> array = New<v8::Array>(res.size());
	for (unsigned long int i = 0; i < res.size(); ++i)
		Nan::Set(array, i, Nan::New(res[i]));
	info.GetReturnValue().Set(array);
}

NAN_METHOD(api_get_percentile)
{
	Local<Object> obj = info[0]->ToObject(Nan::GetCurrentContext())
						.ToLocalChecked();
	vector<double> x = getDoubleArrayFromObj(obj, "x");
	double percentile = getDoubleFromObj(obj, "percentile");
	double res;
	try {
		res = get_percentile(x, percentile);
	}
	catch (const char *err) {
		Local<String> err_string = Nan::New<String>(err).ToLocalChecked();
		info.GetReturnValue().Set(err_string);
		return;
	}
	Local<Value> value = Nan::New(res);
	info.GetReturnValue().Set(value);
}

NAN_MODULE_INIT(Init)
{
	DECL_API("logicle_transform", api_logicle_transform);

	DECL_API("hyperlog_transform", api_hyperlog_transform);

	DECL_API("fast_logicle_transform", api_fast_logicle_transform);

	DECL_API("get_percentile", api_get_percentile);
}

NODE_MODULE(logicle_api, Init);

