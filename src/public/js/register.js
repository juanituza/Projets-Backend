const form = document.getElementById("registerForm")


form.addEventListener('submit',async (event)=>{
    event.preventDefault();
    const data = new FormData(form);
    const obj={};
    data.forEach((value,key)=>obj[key] = value);

    const response = await fetch('/api/sessions/register',{
        method:'POST',
        body:JSON.stringify(obj),
        headers:{
            "Content-Type":"application/json"
        }
    })

    const responseData = await response.json()
    if (responseData.status === "success") {
      Swal.fire({
        title: "Successful registration",
        text: "You will be redirected to the login",
        icon: "success",
        showCancelButton: false,
        confirmButtonText: "OK",
      })
      .then((result) => {
        if (result.isConfirmed) {
          window.location.replace("/login");
        }
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: responseData.error,
      });
    }
   
})