#include "example.hpp"
#include <cstdio>
#include <fstream>
#include <sstream>
#include <string>

#include <rapidjson/document.h>
#include <rapidjson/writer.h>
#include <rapidjson/prettywriter.h>

int main(int argc, char **argv)
{
    std::printf("Hello Data!\n");

    SimpleClass myClass;
    myClass.intMember.stringMember = "rapid";
    myClass.extMember.initialized = true;

    std::string filePath = "./bin/out.json";
    std::ofstream f(filePath);
    rapidjson::StringBuffer sb;
    rapidjson::Writer<rapidjson::StringBuffer> writer(sb);
    
    myClass.to_json(writer);
    f << sb.GetString();
    f.flush();
    f.close();

    std::string pfilePath = "./bin/pretty.json";
    std::ofstream pf(pfilePath);
    rapidjson::StringBuffer psb;
    rapidjson::PrettyWriter<rapidjson::StringBuffer> pwriter(psb);
    pwriter.SetIndent('\t', 1);

    myClass.to_json(pwriter);
    pf << psb.GetString();
    pf.flush();
    pf.close();


    return 0;
}