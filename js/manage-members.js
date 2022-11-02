
const pageSize=5;
let page=1;

getMembers();


function getMembers(query=`${$('#txt-search').val()}`){
    /* (1) Initiate a XMLHttpRequest object */
    console.log(query);
    const http=new XMLHttpRequest();

    /* (2) Set an event listner to detect state change */
    http.addEventListener('readystatechange',()=>{
        if(http.readyState===http.DONE){
            if(http.status===200){

                const count=+http.getResponseHeader('X-Total-Count');
                initPagination(count)


                const members=JSON.parse(http.responseText);

                if(members.length==0){
                    $("#member-table").addClass("empty");
                }
                else{
                    $("#member-table").removeClass("empty");
                }


                $('#member-table tbody tr').remove();
                members.forEach(member => {
                    const rowHtml=`
                    <tr tabindex="0">
                        <td>${member.id}</td>
                        <td>${member.name}</td>
                        <td>${member.contact}</td>
                        <td>${member.address}</td>
                    </tr>`
                    $("#tbl-members-tbody").append(rowHtml);
                    
                    
                });
            }else{
                console.log("abc");
                $("#member-table").addClass("empty");
            }
            $('#loader').removeClass("lds-ring");

        }
    });


    /* (3) open the request*/

    http.open("GET",`http://localhost:8080/lms/api/members?size=${pageSize}&page=${page}`,true);


    /* (4) Set additional information for the request*/




    /* (5) Send the request*/

    http.send();
}




function initPagination(totalCount){

    const totalPages=Math.ceil(totalCount/pageSize);
    let html=``;

    for(let i=1;i<=totalPages;i++){
        html+=`<li class="page-item"><a class="page-link" href="#">${i}</a></li>`;

    }



    html=`<li class="page-item ${page===1?'disabled':''}"><a class="page-link" href="#">Previous</a></li>
    ${html}
    <li class="page-item" ${page===totalPages? 'disabled':''}><a class="page-link" href="#">Next</a></li>`;


    $('#pagination > .pagination').html(html);


}

$('#pagination > .pagination').click((eventData)=>{
    const elm=eventData.target;
    if(elm && elm.tagName === "A"){
        const activePage=$(elm).text();
        if(activePage === "Next"){
            page++;
        } else if(activePage === "Previous"){
            page--;
        } else{
            if(page !== activePage){
                page=+activePage;
                getMembers();
            }
        }
    }
})


$('#txt-search').on('input',()=>{
    activePage=1;
    console.log("abc")
    getMembers();

})

$('#member-table tbody').keyup((eventData)=>{

    if(eventData.which===38){
        const elm=document.activeElement.previousElementSibling;
        if(elm instanceof HTMLTableRowElement){
            elm.focus();
        }
    }
    else if(eventData.which===40){
        const elm=document.activeElement.nextElementSibling;
        if(elm instanceof HTMLTableRowElement){
            elm.focus();
        }
    }
})

console.log($('member-table tbody'))

$(document).keydown((eventData)=>{
    if(eventData.ctrlKey && eventData.which===75){
    
        console.log(eventData.which)
        $("#search").focus();
    }
});