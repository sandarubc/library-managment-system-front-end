
const pageSize=5;
let page=1;

API_END_POINT="http://localhost:8080/lms/api";

getMembers();


function getMembers(query=`${$('#search').val()}`){

    
    /* (1) Initiate a XMLHttpRequest object */
    
    const http=new XMLHttpRequest();

    /* (2) Set an event listner to detect state change */
    http.addEventListener('readystatechange',()=>{
        if(http.readyState===http.DONE){
            $("#loader").hide();
            
            if(http.status===200){

                const count=+http.getResponseHeader('X-Total-Count');
                initPagination(count);


                const members=JSON.parse(http.responseText);

                if(members.length==0){
                    $("#member-table").addClass("empty");
                }
                else{
                    $("#member-table").removeClass("empty");
                }


                $('#member-table tbody tr').remove();
                members.forEach((member,index) => {
                    const rowHtml=`
                    <tr tabindex="0">
                        <td>${member.id}</td>
                        <td>${member.name}</td>
                        <td>${member.contact}</td>
                        <td>${member.address}</td>
                    </tr>`;
                    $("#tbl-members-tbody").append(rowHtml);
                    
                    
                });
            }else{
                showToast('Failed to load members, try refreshing again');
            }

        }
    });


    /* (3) open the request*/



    http.open("GET",`${API_END_POINT}/members?size=${pageSize}&page=${page}`+(query.length>0?`&q=${query}`:""),true);


    /* (4) Set additional information for the request*/

    /* (5) Send the request*/

    http.send();
}




function initPagination(totalCount){

    if(page<=0) page=1;

    const totalPages=Math.ceil(totalCount/pageSize);

    if (totalPages <= 1){
        $("#pagination").addClass('d-none');
    }else{
        $("#pagination").removeClass('d-none');
    }


    let html=``;

    /* if(page>totalPages) {
        page=totalPages;
        getMembers();
        return;
    } */

    for(let i=1;i<=totalPages;i++){
        html+=`<li class="page-item ${page===i?'disabled':''}"><a class="page-link" href="#">${i}</a></li>`;

    }



    html=`<li class="page-item ${page===1?'disabled':''}"><a class="page-link" href="#">Previous</a></li>
    ${html}
    <li class="page-item ${page===totalPages? 'disabled':''}"><a class="page-link" href="#">Next</a></li>`;


    $('#pagination > .pagination').html(html);


}

$('#pagination > .pagination').click((eventData)=>{
    const elm=eventData.target;
    if(elm && elm.tagName === "A"){
        const activePage=$(elm).text();
        if(activePage === "Next"){
            page++;
            getMembers();
        } else if(activePage === "Previous"){
            page--;
            getMembers();
        } else{
            if(page !== activePage){
                page = +activePage;
                getMembers();
            }
        }
    }
})


$('#search').on('input',()=>{
    activePage=1;
    page=1;
    getMembers();

});

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

$(document).keydown((eventData)=>{
    if(eventData.ctrlKey && eventData.key==='/'){  
        $("#search").focus();
    }
});

$("#btn-new-member").click(()=>{
    
    const frmMemberDetails = new bootstrap.Modal(document.getElementById('frm-member-detail'));
    frmMemberDetails.show();

    $("#txt-id, #txt-name, #txt-address, #txt-contact").attr('disabled', false).val('');

    $('#frm-member-detail')
    .removeClass('edit')
    .addClass('new')
    .on('show.bs.modal', ()=>{

        $('#txt-name').focus();
    });

    frmMemberDetails.show();


});



$("#frm-member-detail form").submit((eventData)=> {
    
    eventData.preventDefault();
    $("#btn-save").click();
});


$("#btn-save").click(async ()=>{

    const name=$("#txt-name").val();
    const address=$("#txt-address").val();
    const contact=$("#txt-contact").val();

    let validated=true;

    $("#txt-name, #txt-address, #txt-contact").removeClass('is-invalid');


    if(!(/^\d{3}-\d{7}$/.test(contact))){
        $('#txt-contact').addClass('is-invalid').select().focus();
        validated=false;
    }

    if(!/^[A-Za-z ]+$/.test(name)){
        $("#txt-name").addClass('is-invalid');
        validated=false;
    
    }

    if(!/^[A-Za-z0-9#|,./\-:;]+$/.test(address)){

        $("#txt-address").addClass('is-invalid');
        validated=false;
    }

    if(!validated) return;

    try{
        $("#overlay").removeClass("d-none");
        const {id} = await saveMember();
        $("#overlay").addClass("d-none");
        showToast(`Member has been saved successfully with the ID: ${id}`, 'success');
        $("#txt-name, #txt-address, #txt-contact").val("");
        $("#txt-name").focus();
    }catch(e){
        $("#overlay").addClass("d-none");
        showToast("Failed to save the member, try again", 'error');
        $("#txt-name").focus();
    }

})

function saveMember(){
    
    return new Promise((resolve,reject)=>{


        const xhr = new XMLHttpRequest();

        xhr.addEventListener('readystatechange', ()=> {
           
            if (xhr.readyState === XMLHttpRequest.DONE){
                if (xhr.status === 201){
                    resolve(JSON.parse(xhr.responseText));
                }else{
                    reject();
                }
            }
        });

        xhr.open('POST', `${API_END_POINT}/members`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        const member = {
            name: $("#txt-name").val(),
            address: $("#txt-address").val(),
            contact: $("#txt-contact").val()
        }

        xhr.send(JSON.stringify(member));
    });
};




function showToast(msg, msgType = 'warning'){
   
    $("#toast").removeClass('text-bg-warning')
        .removeClass('text-bg-primary')
        .removeClass('text-bg-error')
        .removeClass('text-bg-success');

    if (msgType === 'success'){
        $("#toast").addClass('text-bg-success');
    }else if (msgType === 'error'){
        $("#toast").addClass('text-bg-error');
    }else if(msgType === 'info'){
        $("#toast").addClass('text-bg-primary');
    }else {
        $("#toast").addClass('text-bg-warning');
    }

    $("#toast .toast-body").text(msg);
    $("#toast").toast('show');
};
$("#frm-member-detail").on('hidden.bs.modal', ()=> {
    getMembers();
});

$('#member-table tbody').click(({target})=>{


    if( !target) return;

    let rowEle=target.closest('tr');

    /* if(target && target instanceof HTMLTableRowElement){
        target=rowEle;
    }else if(target instanceof HTMLTableCellElement){
        rowEle=target.parentElement;
    }else{
        return;
    } */
    

    getMemberDetails($(rowEle.cells[0]).text());
});

async function getMemberDetails(memberId){

    try{
        const response=await fetch(`${API_END_POINT}/members/${memberId}`);

        if(response.ok){

            const member=await response.json();
            const frmMemberDetails=new bootstrap.Modal(document.getElementById('frm-member-detail'));

            $('#frm-member-detail').removeClass('new').removeClass('edit');

            $('#txt-id').attr('disabled','true').val(member.id);
            $('#txt-name').attr('disabled','true').val(member.name);
            $('#txt-address').attr('disabled','true').val(member.address);
            $('#txt-contact').attr('disabled','true').val(member.contact);

            frmMemberDetails.show();



        }else{

            throw new Error(response.status);
        }


    }catch(error){
        showToast('Failed to fetch the member details');
    }

    
    
    /* 

    const http=new XMLHttpRequest();


    http.addEventListener('readystatechange',()=>{
        if(http.readyState===XMLHttpRequest.DONE){
            if(http.status===200){JSON.parse(http.responseText);

                const frmMemberDetails=new bootstrap.Modal(document.getElementById('frm-member-detail'));

                $('#frm-member-detail').removeClass('new');

                $('#txt-id').attr('disabled','true').val(member.id);
                $('#txt-name').attr('disabled','true').val(member.name);
                $('#txt-address').attr('disabled','true').val(member.address);
                $('#txt-contact').attr('disabled','true').val(member.contact);

                frmMemberDetails.show();


                console.log(http.responseText);
            }else{
                showToast("Failed");
            }
        }

    });

    http.open('GET',`${API_END_POINT}/members/${memberId}`,true);

    http.send();
 */


}


$('#btn-edit').click(()=>{

    $('#frm-member-detail').addClass('edit');
    $('#txt-name, #txt-address, #txt-contact').attr('disabled',false);
});

$('#btn-delete').click(async ()=>{
    $("#overlay").removeClass("d-none");

    try{
        const response=await fetch(`${API_END_POINT}/members/${$('#txt-id').val()}`,{method:'DELETE'});
        if(response.status===204){
            showToast('Member has been deleted sucessfully', 'sucess');
            $("#btn-close").click();
        }else{
            throw new Error(response.status);
        }
    }catch(error){
        showToast("Failed to delete the member, try again!");
    } finally{

        $("#overlay").addClass("d-none");
    }

});


$("#btn-update").click(async ()=>{

    const name=$("#txt-name").val();
    const address=$("#txt-address").val();
    const contact=$("#txt-contact").val();

    let validated=true;


    if(!(/^\d{3}-\d{7}$/.test(contact))){
        $('#txt-contact').addClass('is-invalid').select().focus();
        validated=false;
    }

    if(!/^[A-Za-z ]+$/.test(name)){
        $("#txt-name").addClass('is-invalid');
        validated=false;
    
    }

    if(!/^[A-Za-z0-9#|,./\-:;]+$/.test(address)){

        $("#txt-address").addClass('is-invalid');
        validated=false;
    }

    if(!validated) return;

    $('#overlay').removeClass('d-none');

    try{
        const response=await fetch(`${API_END_POINT}/members/${$('#txt-id').val()}`,
        {method:"PATCH",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            id:$('#txt-id').val(),
            name,address, contact
        })}
        );
        if(response.status===204){
            showToast("Member has been updated sucessfully","sucess");
        }
        else{
            throw new Error(response.status);
        }
    }
    
    catch(error){
        showToast("Failde to Update the member, try again!");
    }

    finally{
        $('#overlay').addClass('d-none');
    }


});