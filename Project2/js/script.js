const headTablePersonnel = ['', 'Name', 'Job Title', 'Email', 'Departments', 'Location'];
const headTableDepartments = ['', 'Department', 'Location'];
const headTableLocations = ['', 'Location',]; 
var selectedView = 'personnel'//department || location
var personnelID;
var departmentID;
var locationID;

// Loading
$(document).ready(function() {
   $(".loader").fadeOut("slow"); 
   $.ajax({
      url: "php/getAll.php",
      type: 'POST',
      dataType: 'json',
      success: function(resultPersonnel) {
         loadTableData(headTablePersonnel, resultPersonnel['data'])
      }
   }); 
  
}); 


// Personnel Nav Button
$('#Personnel').on('click', function() {
   selectedView = "personnel";
      $.ajax({
      url: "php/getAll.php",
      type: 'POST',
      dataType: 'json',
      success: function(resultPersonnel) {
         loadTableData(headTablePersonnel, resultPersonnel['data'])
      }
   });  
});

// Department Nav Button
$('#Department').on('click', function() {
   selectedView = "department";
   $.ajax({
      url: "php/getAllDepartments.php",
      type: 'POST',
      dataType: 'json',
      success: function(resultDepartments) {
         loadTableData(headTableDepartments, resultDepartments['data'])
      }
   });
});

// Location Nav Button
$('#Location').on('click', function() {
   selectedView = "location";
   $.ajax({
      url: "php/getAllLocations.php",
      type: 'POST',
      dataType: 'json',
      success: function(resultLocations) {
         loadTableData(headTableLocations, resultLocations['data'])
      }
   });

});


// Main Table - Populate table
function loadTableData(headTable, bodyTable) {
   let headerTableHTML = $("#tableHead");
   headerTableHTML.empty();
   let row = "<tr>";
   headerTableHTML.append("<tr>");
   headTable.forEach(headItem =>{
      row += ("<td style='padding-top: 50px;'>" + headItem + "</td>");
   })
   row += "</tr>";
   headerTableHTML.append(row);
   
   
   let bodyTableHTML = $("#tableBody");
   bodyTableHTML.empty();
   bodyTable.forEach( bodyItem => {
      row = "";
      row += "<tr data-toggle='modal' data-id='"+bodyItem['id']+"' data-target='#'>";
      row += "<td><button type='submit' class='btn btn-danger deleteButton' data-id='"+ bodyItem['id'] +"'><i class='fa-regular fa-trash-can'></i></button></td>";
      if ('lastName' in bodyItem && 'firstName' in bodyItem){
      row += ("<td>" + bodyItem['lastName'] + ", " + bodyItem['firstName'] + "</td>");
      }
      for (var key in bodyItem ) {
         if(key == "id" || key == "lastName" || key == "firstName"){
            continue;
         }
         row += ("<td>" + bodyItem[key] + "</td>");  
      }
      row += "</tr>";
      bodyTableHTML.append(row);
   });



  // Modals 
   $(".table-striped").find('tr[data-target]').on('click', function(){
      

      // Personel Modal
      if(selectedView == "personnel") {
         personnelID = $(this).data('id');
         
         $.ajax({
            url: "php/getPersonnelByID.php",
            type: 'POST',
            dataType: 'json',
            data: {
               id: personnelID
            },
            success: function(resultPersonnelByID) {
      
               $.ajax({
                  url: "php/getAllDepartments.php",
                  type: 'POST',
                  dataType: 'json',
                  success: function(resultDepartments) {
                     
                     $('#firstName').val(resultPersonnelByID['data']['personnel'][0]['firstName']);
                     $('#lastName').val(resultPersonnelByID['data']['personnel'][0]['lastName']);
                     $('#jobTitle').val(resultPersonnelByID['data']['personnel'][0]['jobTitle']);
                     $('#email').val(resultPersonnelByID['data']['personnel'][0]['email']);
                     $('#departmentID').empty();
                     resultDepartments.data.forEach( department => {
                        $('#departmentID').append($('<option>', {
                            value: department.id,
                            text: department.name
                        }))
                     });
                     $('#departmentID').val(resultPersonnelByID['data']['personnel'][0]['departmentID']);
                  }
               });
               $('#personnelModal').modal('show');
            }
         });
      }

      // Department Modal
      if(selectedView == "department") {
         departmentID = $(this).data('id');

         $.ajax({
            url: "php/getDepartmentByID.php",
            type: 'POST',
            dataType: 'json',
            data: {
               id: departmentID
            },
            success: function(resultDepartmentByID) {

               $.ajax({
                  url: "php/getAllLocations.php",
                  type: 'POST',
                  dataType: 'json',
                  success: function(resultLocations) {

                     $('#nameDepartment').val(resultDepartmentByID['data'][0]['name']);
                     $('#locationID').empty();
                     resultLocations.data.forEach(location => {
                        $('#locationID').append($('<option>', {
                            value: location.id,
                            text: location.name
                        }));
                     })
                     $('#locationID').val(resultDepartmentByID['data'][0]['locationID']);
                  }
               });
               $('#departmentModal').modal('show');
            }
         });
      }

      // Location Modal
      if(selectedView == "location") {
         locationID = $(this).data('id');

         $.ajax({
            url: "php/getLocationByID.php",
            type: 'POST',
            dataType: 'json',
            data: {
               id: locationID
            },
            success: function(resultLocationByID) {
               $('#nameLocation').val(resultLocationByID['data'][0]['name']);
               $('#locationModal').modal('show');
            }
         });
      }
   });


   // Delete Button
   $(".table-striped").find('.deleteButton').one('click', function(event) {
      event.stopPropagation();

      // Delete Personnel
      if(selectedView == "personnel") {
         var personnelID = $(this).closest('tr').data('id');
         $('#areYouSureDeletePersonnelModal').modal('show');

         $('#deletePersonnelBtn').off('click').one('click', function() {
            $.ajax({
               url: "php/deletePersonnelByID.php",
               type: 'POST',
               dataType: 'json',
               data: {
                  id: personnelID,
                  
               },
               success: function(resultDeletePersonnel) {
                  
                  if (resultDeletePersonnel.status.code == 200) {
                     $('#areYouSureDeletePersonnelModal').modal('hide');
                     $('#Personnel').trigger('click');
                  
                  };
     
                     
               },
               error: function(jqXHR, textStatus, errorThrown) {
                  error('Error while trying to delete personnel');
               }
               
            });
         });


            
      
      }
      
      // Delete Department Modal
      if(selectedView == "department") {
         // console.log(event)
         var departmentID = $(this).attr("data-id");   
         
               $.ajax({
                  url: "php/countDepartment.php",
                  type: 'POST',
                  dataType: 'json',
                  data: {
                     id: departmentID,
                  },
               
                  success: function(resultCountDepartment) {
                     
                     if(resultCountDepartment.data.departmentCount == 0) {
                        $("#areYouSureDeptName").text(resultCountDepartment.data.departmentName);
                        $('#areYouSureDeleteDepartmentModal').modal('show');
                        $('#deleteDepartmentBtn').one('click', function() {
                           $.ajax({
                              url: "php/deleteDepartmentByID.php",
                              type: 'POST',
                              dataType: 'json',
                              data: {
                                 id: departmentID,
                                    
                              },
                              success: function(resultDeleteDepartment) {
                                 
                                 if (resultDeleteDepartment.status.code == 200) {
                                    $('#departmentModal').modal('hide');
                                    $('#areYouSureDeleteDepartmentModal').modal("hide");
                                    $('#Department').trigger('click');
                                 };     
                              },
                              error: function(jqXHR, textStatus, errorThrown) {
                              }
                           });
                        })
                     } else {
                        $("#cantDeleteDeptName").text(resultCountDepartment.data.departmentName);
                        $("#countDept").text(resultCountDepartment.data.departmentCount);
                        $('#confirmModalDepartment').modal('show');
                        $('#departmentModal').modal('hide');
                     }
                  },
                  error: function(jqXHR, textStatus, errorThrown) {
                              
                  }
               });
      } 
         
      
         // Delete Location Modal
      if(selectedView == "location") {
         
         var locationID = $(this).attr("data-id");

            
               $.ajax({
                  url: "php/countLocation.php",
                  type: 'POST',
                  dataType: 'json',
                  data: {
                     id: locationID,
                  },
                  
                  success: function(resultCountLocation) {
                     
                     if(resultCountLocation.data.departmentLocCount == 0) {
                        $("#areYouSureLocationName").text(resultCountLocation.data.locationName);
                        $('#areYouSureDeleteLocationModal').modal('show');
                        $('#deleteLocationBtn').one('click', function() {
                           $.ajax({
                              url: "php/deleteLocationByID.php",
                              type: 'POST',
                              dataType: 'json',
                              data: {
                                    id: locationID,
                              
                              },
                              success: function(resultDeleteLocation) {
                                 
                                 if (resultDeleteLocation.status.code == 200) {
                                    $('#locationModal').modal('hide');
                                    $('#areYouSureDeleteLocationModal').modal("hide");
                                    $('#Location').trigger('click');
                                 };
                                 
                                 
                              },
                              error: function(jqXHR, textStatus, errorThrown) {
                              
                              }
                           });
                        })
                     } else {
                        $("#cantDeleteLocationName").text(resultCountLocation.data.locationName);
                        $("#countLoc").text(resultCountLocation.data.departmentLocCount);
                        $('#confirmModalLocation').modal('show');
                        $('#locationModal').modal('hide');
                     }
            
                    
                     
                     
                  },
                  error: function(jqXHR, textStatus, errorThrown) {
                     
                  }
               });
            
      }
      
   
        
   });

  
};



 
// Update Personnel - button modal
$('#updatePersonnel').on("submit", function(e){
   e.preventDefault();
   var lastName = $('#lastName').val();
   var firstName = $('#firstName').val();
   var jobTitle = $('#jobTitle').val();
   var email = $('#email').val();
  
  
   $.ajax({
      url: "php/updatePersonnelByID.php",
      type: 'POST',
      dataType: 'json',
      data: {
         id: personnelID,
         firstName: firstName,
         lastName: lastName,
         jobTitle: jobTitle,
         email: email,
         departmentID: $('#departmentID option:selected').val()
      },
      success: function(resultUpdatePersonnel) {
         
         if (resultUpdatePersonnel.status.code == 200) {
            $('#personnelModal').modal('hide');
            $('#Personnel').trigger('click');      
         };     
      },
      error: function(jqXHR, textStatus, errorThrown) {
         error('Error while trying to update personnel');
      }
   });
  
})


$('#personnelModal').on('shown.bs.modal', function () {
   $('#lastName').focus();
});

$('#personnelModal').on('hidden.bs.modal', function () {
   $('#updatePersonnel')[0].reset();
});




// Update Department - button modal
$('#updateDepartment').on("submit", function(e) {
   e.preventDefault();
   var name = $('#nameDepartment').val();
   

   $.ajax({
      url: "php/updateDepartmentByID.php",
      type: 'POST',
      dataType: 'json',
      data: {
         id: departmentID,
         nameDepartment: name,
         locationID: $('#locationID option:selected').val()
      },
      success: function(resultUpdateDepartment) {
         if (resultUpdateDepartment.status.code == 200) {
            
            $('#departmentModal').modal('hide');
            $('#Department').trigger('click');
            
        };
         
         
      },
      error: function(jqXHR, textStatus, errorThrown) {
         error('Error while trying to update department');
     }
  });

});

 $('#departmentModal').on('shown.bs.modal', function () {
   $('#nameDepartment').focus();
 });

 $('#departmentModal').on('hidden.bs.modal', function () {
   $('#updateDepartment')[0].reset();
 });



// Save Location - button modal
$('#updateLocation').on('submit', function(e) {
   e.preventDefault();
   var name = $('#nameLocation').val();
  
   $.ajax({
      url: "php/updateLocationByID.php",
      type: 'POST',
      dataType: 'json',
      data: {
         id: locationID,
         name: name,
         
        
         
      },
      success: function(resultUpdateLocation) {
         if (resultUpdateLocation.status.code == 200) {
            $('#locationModal').modal('hide');
            $('#Location').trigger('click');   
         };
         
         
      },
      error: function(jqXHR, textStatus, errorThrown) {
         error('Error while trying to update location');
     }
  });

});

$('#locationModal').on('shown.bs.modal', function () {
   $('#nameLocation').focus();
});

$('#locationModal').on('hidden.bs.modal', function () {
   $('#updateLocation')[0].reset();
});



// Add Button
$('#addButton').off('click').on('click', function() {
// Add Personnel Modal 
   if(selectedView == "personnel") {
       
               
      $.ajax({
         url: "php/getAllDepartments.php",
         type: 'POST',
         dataType: 'json',
         success: function(resultDepartments) {
            $('#firstNameAdd').val('');
            $('#lastNameAdd').val('');
            $('#jobTitleAdd').val('');
            $('#emailAdd').val(''); 
            $('#departmentAdd').empty();
            
            resultDepartments.data.forEach( department => {
               $('#departmentIDAdd').append($('<option>', {
                  value: department.id,
                  text: department.name
                  
               }))
            }); 
         },
      });
      $('#personnelAddModal').modal('show');
      

      // Button Add Personnel 
      $('#addPersonnelForm').one('submit', function(e) {
          e.preventDefault();
         var lastName = $('#lastNameAdd').val();
         var firstName = $('#firstNameAdd').val();
         var email = $('#emailAdd').val();
         var jobTitle = $('#jobTitleAdd').val();
         
         
      
         $.ajax({
            url: "php/insertPersonnel.php",
            type: 'POST',
            dataType: 'json',
            data: {
               firstName: firstName,
               lastName: lastName,
               jobTitle: jobTitle,
               email: email,
               departmentID: $('#departmentIDAdd option:selected').val()
            },
            success: function(resultInsertPersonnel) {
               if (resultInsertPersonnel.status.code == 200) {
                  $('#personnelAddModal').modal('hide');
                  $('#Personnel').trigger('click');
                  
               }
            },
         });
      });
   }

   $('#personnelAddModal').on('shown.bs.modal', function () {
      $('#lastNameAdd').focus();
   });

   $('#personnelAddModal').on('hidden.bs.modal', function () {
      $('#addPersonnelForm')[0].reset();
   });

   // Add Department Modal
   if(selectedView == "department") {
         
      
         
      $.ajax({
         url: "php/getAllLocations.php",
         type: 'POST',
         dataType: 'json',
         success: function(resultLocations) {
            $('#nameDepartmentAdd').val('');
            $('#locationIDAdd').empty();
            resultLocations.data.forEach(location => {
               $('#locationIDAdd').append($('<option>', {
                  value: location.id,
                  text: location.name
               }));
            })
         },
      });
      $('#departmentAddModal').modal('show');


      // Button Add Department 
      $('#addDepartmentForm').one('submit', function(e) {
         e.preventDefault();
         var name = $('#nameDepartmentAdd').val();
         

         $.ajax({
            url: "php/insertDepartment.php",
            type: 'POST',
            dataType: 'json',
            data: {
               name: name,
               locationID: $('#locationIDAdd option:selected').val()
            },
            success: function(resultInsertDepartment) {
               if (resultInsertDepartment.status.code == 200) {
                  
                  $('#departmentAddModal').modal('hide');
                  $('#Department').trigger('click');
                  
            }  
            },
         });
      });
   }

   $('#departmentAddModal').on('shown.bs.modal', function () {
      $('#nameDepartmentAdd').focus();
   });

   $('#departmentAddModal').on('hidden.bs.modal', function () {
      $('#addDepartmentForm')[0].reset();
   });





   // Add Location Modal
   if(selectedView == "location") {
      
      $('#nameAddLocation').val('');
      $('#locationAddModal').modal('show');
      

      // Button Add Location
      $('#addLocationForm').one('submit', function(e) {
         e.preventDefault();
         var name = $('#nameAddLocation').val();
         
         
         $.ajax({
            url: "php/insertLocation.php",
            type: 'POST',
            dataType: 'json',
            data: {
               
               name: name,
            },
            success: function(resultInsertLocation) {
               if (resultInsertLocation.status.code == 200) {
                  $('#locationAddModal').modal('hide');
                  $('#Location').trigger('click');
                  
            }  
            },
         });
      });
   }
   $('#locationAddModal').on('shown.bs.modal', function () {
      $('#nameAddLocation').focus();
   });

   $('#locationAddModal').on('hidden.bs.modal', function () {
      $('#addLocationForm')[0].reset();
   });

});



   //  Search Input
let timer;
$('#inputSearch').keyup(function() {
   clearTimeout(timer);  
   timer = setTimeout(function() {
      if(selectedView == "personnel") {

         $.ajax({
            url: "php/searchPersonnel.php",
            type: 'POST',
            dataType: 'json',
            data: {
               firstName: $('#inputSearch').val(),
               lastName: $('#inputSearch').val()
         
            },
            success: function(resultSearchPersonnel) {
               
               loadTableData(headTablePersonnel, resultSearchPersonnel['data'])
         
            },
         });
   
      }
   
      if(selectedView == "department") {
   
         $.ajax({
            url: "php/searchDepartment.php",
            type: 'POST',
            dataType: 'json',
            data: {
               name: $('#inputSearch').val(),
               
         
            },
            success: function(resultSearchDepartment) {
               
               loadTableData(headTableDepartments, resultSearchDepartment['data'])
         
            },
         });
   
      }
   
      if(selectedView == "location") {
   
         $.ajax({
            url: "php/searchLocation.php",
            type: 'POST',
            dataType: 'json',
            data: {
               name: $('#inputSearch').val(),
               
         
            },
            success: function(resultSearchLocation) {
               
               loadTableData(headTableLocations, resultSearchLocation['data'])
            },
         });
   
      }
      
    }, 1000);
   



});



// Scroll button
var btn = $('#returnTopButton');

$(window).scroll(function() {
  if ($(window).scrollTop() > 300) {
    btn.addClass('show');
  } else {
    btn.removeClass('show');
  }
});

btn.on('click', function(e) {
  e.preventDefault();
  $('html, body').animate({scrollTop:0}, '300');
});

 




