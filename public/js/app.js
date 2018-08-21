var app = angular.module("fp", []);

app.controller("MainController", function($scope, $http, $timeout, Downloader) {
  var history_array = [];
  var unique_value;

  //canvas init
  var canvas = new fabric.Canvas("c", { backgroundColor: "#fff" });
  canvas.setDimensions({
    width: 700,
    height: 500
  });
  var Initial_Text = new fabric.IText("Double click here edit.", {
    left: 50,
    top: 50,
    fontFamily: "Helvetica",
    fill: "#000",
    lineHeight: 1
  });
  canvas.add(Initial_Text);

  //File Upload
  $scope.addImage = document
    .getElementById("file")
    .addEventListener("change", function(e) {
      var file = e.target.files[0];
      var reader = new FileReader();
      reader.onload = function(f) {
        var data = f.target.result;
        fabric.Image.fromURL(data, function(img) {
          var oImg = img
            .set({
              left: 0,
              top: 0,
              angle: 0,
              width: 100,
              height: 100
            })
            .scale(0.9);
          canvas.add(oImg).renderAll();
          var a = canvas.setActiveObject(oImg);
          var dataURL = canvas.toDataURL({
            format: "png",
            quality: 0.8
          });
        });
      };
      reader.readAsDataURL(file);
    });

  //Delete Object
  $scope.deleteObject = function() {
    canvas.getActiveObject().remove();
  };

  //Routine for new next object
  $scope.textTemplate = function() {
    var tText = new fabric.IText("New Text", {
      left: 100,
      top: 100
    });
    canvas.add(tText);
    canvas.setActiveObject(tText);
    tText.bringToFront();
  };

  //Edit tracking
  $scope.History = function() {
    console.log("Canvas is now being tracked");

    canvas.on("object:modified", function() {
      var sequence = [];
      sequence.push(canvas.toJSON());
      unique_value = sequence;
      // console.log(unique_value);
    });
    history_array.push(unique_value[unique_value.length - 1]);
    $scope.history_data = history_array;
  };

  //Updating data from db
  $scope.UpdateData = function() {
    $http({
      method: "GET",
      url: "/api/saved"
    }).then(
      function mySuccess(response) {
        $scope.updated_data = response.data;
        console.log("Upadated Database");
      },
      function myError(response) {
        $scope.updated_data = response.statusText;
      }
    );
  };

  $scope.UpdateData();

  //POST data to db
  $scope.SendData = function() {
    $scope.name;
    var template = [
      {
        id: $scope.name,
        data: ""
      }
    ];

    var json = canvas.toJSON();
    json = JSON.stringify(json);

    template[0]["data"] = json;

    $http.post("/api/saved", template).then(
      function(response) {
        if (response.data) $scope.msg = "Post Data Submitted Successfully!";
        console.log("Canvas saved to Db successfully.");
        setInterval($scope.UpdateData(), 1000);
      },
      function(response) {
        $scope.msg = "Service not Exists";
        $scope.statusval = response.status;
        $scope.statustext = response.statusText;
        $scope.headers = response.headers();
      }
    );
  };

  //Render canvas from json data
  $scope.LoadData = function(json) {
    // console.log(json);
    canvas.loadFromJSON(
      json,
      function() {
        canvas.renderAll();
        console.log("Canvas rendered");
      },
      function(o, object) {
        console.log(o, object);
      }
    );
  };

  //Download image using a service
  $scope.Download_Image = function() {
    Downloader.downloader(canvas, "canvas");
  };
}); //controller ends here

//Downloader service
app.service("Downloader", function() {
  this.downloader = function(canvas, name) {
    //  convert canvas to a data url
    download(canvas.toDataURL(), name + ".png");
  };

  function download(url, name) {
    // make the link. href and download
    $("<a>")
      .attr({
        href: url,
        download: name
      })[0]
      .click();
  }
});
