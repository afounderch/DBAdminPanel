const url ="https://e2xnu2maf2ytczggyzgo5r6jsy0mfwjt.lambda-url.ap-south-1.on.aws/";
const getData=async()=>{
    try {
    const response = await fetch(url+"getSteps", {method:"GET",headers: { "Content-Type": "application/json" }});
    const data = await response.json();
    return data
    } catch (error) {
        console.log("Error getting data:",error)
    }
}

const addData=async (data) => {
    try {
       const response =await fetch(url+"insertStep",
        {
            method:"POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        if(response.status){
            return true
        }
        return false
    } catch (error) {
        console.log(error);
    }
}

const updateData = async (id,data) => {
  try {

    const response = await fetch(url+"updateStep/"+id,{
      method:"PUT",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(data)
    });

    return response.ok;

  } catch (error) {
    console.log(error);
  }
}

const removeStep = async(id)=>{

  try{

    const response = await fetch(url+"deleteStep/"+id,{
      method:"DELETE"
    });

    return response.ok;

  }catch(error){
    console.log(error);
  }

}

const uploadToS3 = async (file) => {

  try {
    const res = await fetch(url+"uploadMedia", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type, 
      })
    });

    const data = await res.json();
    await fetch(data.uploadURL, {
      method: "PUT",
      headers: {
        "Content-Type": file.type
      },
      body: file
    });

    console.log("File uploaded successfully");

    return data.key;

  } catch (err) {

    console.log("Upload failed",err);

  }

}


export {
    getData,
    addData,
    updateData,
    removeStep,
    uploadToS3
}