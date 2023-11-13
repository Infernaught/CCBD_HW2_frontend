// Wait for the document to be ready
$(document).ready(function() {
    var sdk = apigClientFactory.newClient({});
    const userInputField = $('#userInput');
    const submitButton = $('#submitButton');
    const userMessageDiv = $('#userMessage');
    const displayCanvas = $('.canvas');
    const maxWidth = 50;
    const maxHeight = 50;

    function callAlbumGetApi(message) {
        // params, body, additionalParams
        console.log(message)
        return sdk.searchGet({q: message});
    }

    function callAlbumPutApi(img, labels, filename) {
        if (labels == '') {
            var params = {
                bucket: 'hw2-photos-us-east1',
                object: filename
            };
            var additionalParams = {
                headers: {
                    customLabel: JSON.stringify(labels),
                    contentType: 'image/' + filename.split('.')[1]
                }
            };
            var body = {img};
            console.log(params);
            console.log(additionalParams);
            console.log(body)
            return sdk.folderItemPut(params, body, additionalParams);
        }
    }

    // Function to handle user input submission
    window.submitUserInput = function() {
      const userInput = userInputField.val();
      //userInputField.val('');
      if ($.trim(userInput) !== '') {
        // send the message to API
        displayCanvas.empty();
        callAlbumGetApi(userInput)
            .then((response) => {
                console.log(response);
                var data = response.data.results;
                if (data && data.length > 1) {
                    console.log('received ' + (data.length - 1) + ' matches');
                    var displaySet = new Set();
                    labels = data[0].labels;
                    var label_text = 'Image with label "';
                    if (labels.length == 1) {
                        label_text += labels[0] + '"';
                    } else {
                        label_text += labels[0] + '" and "' + labels[1] + '"';
                    }
                    displayCanvas.append($('<h2>').text(label_text));
                    for (let i = 1; i < data.length; i++) {
                        if (displaySet.has(data[i].url)) {
                            continue;
                        } else {
                            displaySet.add(data[i].url);
                            var img = $('<img>')
                            img.attr('src', data[i].url);
                            img.attr('title', data[i].labels);
                            // img.load(function(){
                            //     var ratio = Math.min(maxWidth / $(this).width(), maxHeight / $(this).height());
                            //     console.log(ratio);
                            //     console.log($(this).height());
                            //     $(this).attr('width', $(this).width() * ratio);
                            //     $(this).attr('height', $(this).height() * ratio);
                            // });
                            img.appendTo(displayCanvas);
                        }
                    }
                } else {
                    var label_text = 'No image found.';
                    displayCanvas.append($('<h2>').text(label_text));
                }
            })
            .catch((error) => {
                console.log('an error occurred', error);
            });
      }
    };

    // Add event listeners for button click and Enter key press
    submitButton.click(submitUserInput);
    userInputField.keydown(function(event) {
      if (event.key === 'Enter') {
        submitUserInput();
      }
    });

    function clickUpload() {
        var file_data = $('#file')[0].files[0];
        console.log($('#file'));
        // const canv = document.createElement("canvas");;
        // //var _URL = window.URL || window.webkitURL;
        // var img = new Image();
        // img.onload = function() {
        //     canv.height = img.naturalHeight;
        //     canv.width = img.naturalWidth;
        // };
        // var reader = new FileReader();

        // reader.onload = function(event) {
        //     img.src = event.target.result;
        // };

        // reader.readAsDataURL(file_data);
        // //img.src = _URL.createObjectURL(file_data);
        // var ctx = canv.getContext('2d');
        // ctx.drawImage(img, 0, 0);
        // const dataURL = canv.toDataURL();
        // console.log(dataURL);
        var labels = $('#labelInput').val().split(',');
        // dataURL.replace('data:', '').replace(/^.+,/, '')
        var response = callAlbumPutApi(file_data, labels, file_data.name);
    }

    $('input[name=imgUpload]').change(function () {
        $('#uploadResult').empty();
        // async function clickUpload() {
        //     function getBase64(file, onLoadCallback) {
        //         return new Promise(function(resolve, reject) {
        //             var reader = new FileReader();
        //             reader.onload = function() { resolve(reader.result); };
        //             reader.readAsDataURL(file);
        //         });
        //     }
        //     var file_data = $('#file')[0].files[0];
        //     var promise = getBase64(file_data);
        //     // upload to S3
        //     var base64 = '';
        //     base64 = await promise;
        //     var labels = $('#labelInput').val().split(',');
        //     var response = callAlbumPutApi(base64, labels, file_data.name);
        //     console.log(response);
        // }
        var input_label = $('<input>');
        input_label.attr('type', 'text');
        input_label.attr('id','labelInput');
        input_label.attr('placeholder', '(optional) custom label (seperated by ,)');
        input_label.attr("style", 'width:250px;');
        input_label.keydown(function(event) {
            if (event.key === 'Enter') {
                clickUpload();
            }
          });
        $('#uploadResult').append(input_label);
        var upload_button = $('<button>')
        upload_button.attr('id', 'upload');
        upload_button.html('Upload');
        upload_button.click(clickUpload);
        $('#uploadResult').append(upload_button);
    });
});