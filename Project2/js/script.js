const headTablePersonnel = ['Last Name', 'Fist Name', 'Job Title', 'Email', 'Departments', 'Location'];
const headTableDepartments = ['Department', 'Location'];
const headTableLocations = ['Location']; 
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
      row += ("<td>" + headItem + "</td>");
   })
   row += "</tr>";
   headerTableHTML.append(row);
   
   
   let bodyTableHTML = $("#tableBody");
   bodyTableHTML.empty();
   bodyTable.forEach( bodyItem => {
      row = "";
      row += "<tr data-toggle='modal' data-id='"+bodyItem['id']+"' data-target='#'>";
      for (var key in bodyItem) {
         if(key == "id"){
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
};


// Save Personnel - button modal
$('#savePersonnel').on('click', function() {
   var lastName = $('#lastName').val();
   if (lastName == "") {
      $('#confirm').html('Last name must be filled out!');
      $('#alertModal').modal('show');
      return; 
   }

   var firstName = $('#firstName').val();
   if (firstName == "") {
      $('#confirm').html('First name must be filled out!');
      $('#alertModal').modal('show');
      return; 
      }

   var email = $('#email').val();
   if (email == "") {
      $('#confirm').html('Email must be filled out!');
      $('#alertModal').modal('show');
      return; 
   }




   $.ajax({
      url: "php/updatePersonnelByID.php",
      type: 'POST',
      dataType: 'json',
      data: {
         id: personnelID,
         firstName: firstName,
         lastName: lastName,
         jobTitle: $('#jobTitle').val(),
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
});

// Delete Personnel - button modal
$('#deletePersonnel').on('click', function() {
   
   $.ajax({
      url: "php/deletePersonnelByID.php",
      type: 'POST',
      dataType: 'json',
      data: {
         id: personnelID,
         
      },
      success: function(resultDeletePersonnel) {
         if (resultDeletePersonnel.status.code == 200) {
            // $('#updatePersonnel').val();
            $('#personnelModal').modal('hide');
            $('#Personnel').trigger('click');
         };

          
            
            
      },
      error: function(jqXHR, textStatus, errorThrown) {
         error('Error while trying to delete personnel');
      }
   });


});


// Save Department - button modal
$('#saveDepartment').on('click', function() {
   var name = $('#nameDepartment').val();
   if (name == "") {
      $('#confirm').html('Department name must be filled out!');
      $('#alertModal').modal('show');
      return; 
   }

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

// Delete Department - button modal
$('#deleteDepartment').on('click', function() {
   $.ajax({
      url: "php/countDepartment.php",
      type: 'POST',
      dataType: 'json',
     
      success: function(resultCountDepartment) {
         
         if(resultCountDepartment.data['COUNT(id)']  == 0) {
            
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
                     $('#Department').trigger('click');
                  };
                        
                        
               },
               error: function(jqXHR, textStatus, errorThrown) {
                       
               }
            });
            
         } else {
            $('#confirmModalDepartment').modal('show');
            $('#departmentModal').modal('hide');
         }
      },
      error: function(jqXHR, textStatus, errorThrown) {
                    
      }



   });
});


// Save Location - button modal
$('#saveLocation').on('click', function() {
   var name = $('#nameLocation').val();
   if (name == "") {
      $('#confirm').html('Location name must be filled out!');
      $('#alertModal').modal('show');
      return; 
   }
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

// Delete Location - button modal
$('#deleteLocation').on('click', function() {
   $.ajax({
      url: "php/countLocation.php",
      type: 'POST',
      dataType: 'json',
      
      success: function(resultCountLocation) {
         if(resultCountLocation.data['COUNT(id)']  == 0) {
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
                     $('#Location').trigger('click');
                  };
                  
                  
               },
               error: function(jqXHR, textStatus, errorThrown) {
                 
               }
            });
         } else {
            $('#confirmModalLocation').modal('show');
            $('#locationModal').modal('hide');
         }

        
         
         
      },
      error: function(jqXHR, textStatus, errorThrown) {
         
      }
   });
   













//    $.ajax({
//       url: "php/deleteLocationByID.php",
//       type: 'POST',
//       dataType: 'json',
//       data: {
//           id: locationID,
      
//       },
//       success: function(resultDeleteLocation) {
//          if (resultDeleteLocation.status.code == 200) {
//             $('#locationModal').modal('hide');
//             $('#Location').trigger('click');
//         };
         
         
//       },
//       error: function(jqXHR, textStatus, errorThrown) {
//         error('Error while trying to delete location');
//      }
//   });
}); 



// Add Button
$('#addButton').on('click', function() {
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
      $('#CreatePersonnel').off('click').on('click', function() {
         var lastName = $('#lastNameAdd').val();
         if (lastName == "") {
           $('#confirm').html('Last name must be filled out!');
           $('#alertModal').modal('show');
           return; 
         }

         var firstName = $('#firstNameAdd').val();
         if (firstName == "") {
           $('#confirm').html('First name must be filled out!');
           $('#alertModal').modal('show');
           return; 
         }

         var email = $('#emailAdd').val();
         if (email == "") {
           $('#confirm').html('Email must be filled out!');
           $('#alertModal').modal('show');
           return; 
         }
         
         
      
         $.ajax({
            url: "php/insertPersonnel.php",
            type: 'POST',
            dataType: 'json',
            data: {
               firstName: firstName,
               lastName: lastName,
               jobTitle: $('#jobTitleAdd').val(),
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
      $('#CreateDepartment').one('click', function() {
         var name = $('#nameDepartmentAdd').val();
         if (name == "") {
           $('#confirm').html('Department name must be filled out!');
           $('#alertModal').modal('show');
           return; 
         }

         $.ajax({
            url: "php/insertDepartment.php",
            type: 'POST',
            dataType: 'json',
            data: {
               name: $('#nameDepartmentAdd').val(),
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

   // Add Location Modal
   if(selectedView == "location") {
      
      $('#nameAddLocation').val('');
      $('#locationAddModal').modal('show');
      

   // Button Add Location
      $('#CreateLocation').off('click').one('click', function() {
         var name = $('#nameAddLocation').val();
         if (name == "") {
           $('#confirm').html('Location name must be filled out!');
           $('#alertModal').modal('show');
           return; 
         }
         $('#locationAddModal').modal('hide');
         $.ajax({
            url: "php/insertLocation.php",
            type: 'POST',
            dataType: 'json',
            data: {
               
               name: name,
            },
            success: function(resultInsertLocation) {
               if (resultInsertLocation.status.code == 200) {
                  $('#LocationAddModal').modal('hide');
                  $('#Location').trigger('click');
                  
            }  
            },
         });
      });
   }
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
let mybutton = document.getElementById("myBtn");
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
};

function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
};

