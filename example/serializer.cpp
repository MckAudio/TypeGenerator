#include "example.hpp"
#include <cstdio>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>

#include <rapidjson/document.h>
#include <rapidjson/writer.h>
#include <rapidjson/prettywriter.h>

int main(int argc, char **argv)
{
    std::printf("Hello Data!\n");

    SimpleClass myClass;
    myClass.intMember.stringMember = "rapid";
    myClass.extMember.initialized = true;
    myClass.myNumbers.push_back(1);
    myClass.myNumbers.push_back(2);
    myClass.myNumbers.push_back(3);
    myClass.myNumbers.push_back(5);
    myClass.intMember.linkArrayMember.push_back(linkExampleClass());
    myClass.intMember.linkArrayMember[0].values.push_back(42.23);
    myClass.intMember.linkArrayMember[0].values.push_back(9.5);

    // Serialize
    std::string filePath = "./bin/out.json";
    std::ofstream f(filePath);
    rapidjson::StringBuffer sb;
    rapidjson::Writer<rapidjson::StringBuffer> writer(sb);
    myClass.to_json(writer);
    f << sb.GetString();
    f.flush();
    f.close();

    // Deserialize
    std::ifstream inpF(filePath);
    std::stringstream inpBuf;
    inpBuf << inpF.rdbuf();
    inpF.close();

    rapidjson::Document doc;
    std::string inpStr = inpBuf.str();
    doc.Parse(inpStr.c_str());

    SimpleClass myNewClass;
    myNewClass.from_json(doc);

    // Serialize with the Pretty Printer
    std::string pfilePath = "./bin/pretty.json";
    std::ofstream pf(pfilePath);
    rapidjson::StringBuffer psb;
    rapidjson::PrettyWriter<rapidjson::StringBuffer> pwriter(psb);
    pwriter.SetIndent('\t', 1);
    myNewClass.to_json(pwriter);
    pf << psb.GetString();
    pf.flush();
    pf.close();

    return 0;
}