var Ex = {
    style:document.createElement("style")
};
Ex.style.innerHTML = `
    #Form{
        color:#fff;
        text-align: center;
        width: 100%;
        padding: 5% 0 0 0;
    }
    #Temp{
        display:none;
    }
`;
document.head.appendChild(Ex.style);



if(window.location.href.indexOf("https://www.plurk.com/p/")!==-1) PlurkOutJSON();

if(window.location.href.indexOf("https://images.plurk.com/")!==-1) PlurkImageForm();



function PlurkOutJSON(){


    document.querySelectorAll(`a[href^="https://www.plurk.com/p/"]`).forEach(a_link=>{
                        
        var a_link_parentNode = a_link.parentNode;
        if(a_link===undefined) return;

        fetch(a_link.href).then(r=>{return r.text();}).then(html=>{

            var parser = new DOMParser();
            parser.parseFromString(html, 'text/html');

            var fetch_plurk = document.createElement("div");

            fetch_plurk.innerHTML = parser.parseFromString(html, 'text/html').querySelectorAll("#permanent-plurk>div>.content")[0].innerHTML;

            if (a_link_parentNode.contains(a_link))
            a_link_parentNode.replaceChild(fetch_plurk,a_link);

            fetch_plurk.querySelectorAll("a").forEach(a1=>{
                a_link_parentNode.querySelectorAll("a").forEach(a2=>{
                    if(a1.href===a2.href && a1!==a2){
                        a1.remove();
                    }
                });
            });

        }).catch(error => {
            // 處理錯誤
            console.error('Error:', error);
        });
    });

    setTimeout(()=>{
        if(
        document.querySelectorAll(`a[href^="https://www.plurk.com/p/"]`).length>0){

            PlurkOutJSON();

        }else{

            var plurk_html = [];

            //plurk
            plurk_html.push(document.querySelectorAll("#permanent-plurk>div")[0].innerHTML);

            //replurk list
            document.querySelectorAll("#permanent-plurk .list>div").forEach((replurk,i)=>{
                
                plurk_html.push(replurk.innerHTML);

            });

            var out_json = JSON.stringify({
                url:location.href,
                plurk:plurk_html,
                img_base64:{}
            }, null, 2);

            var file = new File(
                [ out_json ],
                `${document.querySelectorAll("#permanent-plurk>div")[0].querySelector(".content").innerText.slice(0,-5)}.json`,
                {
                    type: "application/json"
                }
            );
            
            var link = document.createElement("a");
            var url = URL.createObjectURL(file);

            
            link.href = url;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        }
    },100);
    
}


function PlurkImageForm(){
    
    document.body.innerHTML = `
        <div id="Form">
        <div>
        選擇備份JSON檔：<input type="file">
        <button onclick="Base64InOut();">轉換BASE64開始</button>
        </div>
        </div>
        
        
        <div id="Temp"></div>`;

}

function Base64InOut(){
    
    Ex.file = document.querySelector(`[type="file"]`).files[0];

    Ex.reader = new FileReader();


    Ex.reader.onload = ()=>{

        Ex.fileJSON = JSON.parse(Ex.reader.result);
        var html = Ex.fileJSON.plurk;

        document.querySelector("#Temp").innerHTML = html.join("");

        ImgToBase64( document.querySelectorAll("#Temp img") );
    };

    Ex.reader.readAsText(Ex.file);
}

function DownLoadJSON(base64){

    Ex.fileJSON.img_base64 = base64;

    var out_json = JSON.stringify(Ex.fileJSON, null, 2);

    var file = new File(
        [ out_json ],
        `${Ex.file.name.split(".")[0]} [BASE64].json`,
        {
            type: "application/json"
        }
    );
    
    var link = document.createElement("a");
    var url = URL.createObjectURL(file);

    
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}


async function ImgToBase64(img_list,img_base64 = {}, count = 0){

    if(img_list[count]===undefined){
        DownLoadJSON(img_base64);
        return;
    }
    
    var img;
    var src = img_list[count].src;
    if(src.indexOf("images.plurk.com")===-1){

        count++;
        console.log(`${count}/${img_list.length}`);

        ImgToBase64(img_list,img_base64,count);
        return;
    }
    if(src.indexOf("mx_")===-1){
        src = `https://images.plurk.com/mx_${src.split("/").pop().split(".")[0]}.jpg`
    }

    try{
        img = await fetch(src);
    }catch{

        count++;
        console.log(`${count}/${img_list.length}`);

        ImgToBase64(img_list,img_base64,count);
    }
    var blob = await img.blob();
    
    return new Promise((resolve, reject) => {

        var reader = new FileReader();
        reader.onloadend = () =>{

            
            setTimeout(()=>{

                img_base64[ img_list[count].src ] = reader.result;

                count++;
                console.log(`${count}/${img_list.length}`);

                resolve( ImgToBase64(img_list,img_base64,count) );

            },100);
        }
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

}



/*
async function imageToBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// 測試使用
imageToBase64('https://example.com/image.jpg')
    .then(base64 => console.log(base64))
    .catch(error => console.error('Error:', error));

    */