app.controller('overtimeScheduleController', function ($scope, $http) {
  const domain = 'http://localhost:8080';

  $scope.employees = [];
  $scope.selectedSchedule = {};
  $scope.selectedEmployeeIds = [];
  $scope.currentPage = 0;
  $scope.pageSize = 10;
  $scope.overtimeData = {};


  $scope.getEmployees = function (page = 0) {
    $http.get(`${domain}/api/employees?page=${page}&size=${$scope.pageSize}`)
      .then(response => {
        $scope.employees = response.data.content;
        $scope.totalPages = response.data.totalPages;
        $scope.currentPage = page;
      })
      .catch(error => console.error("Lỗi không thể tải danh sách nhân viên: ", error));
  };

  $scope.getAllOverTime = () => {
    $http.get(`${domain}/api/overtimes`)
      .then(response => {
        $scope.overtimes = response.data.content;
        console.log($scope.overtimes);
      })
      .catch(error => console.error("Lỗi không thể tải danh sách lịch tăng ca: ", error));
  };

  $scope.filterOvertime = function () {
    const { startDate } = $scope.newSchedule;

    // Nếu chưa có ngày bắt đầu, không làm gì
    if (!startDate) {
      console.log("Không có ngày bắt đầu, hiển thị tất cả nhân viên");
      return;
    }

    // Chuyển ngày bắt đầu thành đối tượng Date và gọi hàm lấy dữ liệu
    $scope.getOvertime(new Date(startDate));
  };

  $scope.getOvertime = function (startDate) {
    if (!startDate) {
      return;
    }

    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0'); // Tháng cần +1 vì getMonth() trả về từ 0-11
    const day = String(startDate.getDate()).padStart(2, '0');

    const startDateStr = `${year}-${month}-${day}`;

    // Gọi API chỉ với ngày bắt đầu
    $http.get(`${domain}/api/overtimes?startDate=${startDateStr}`)
      .then(response => {
        $scope.overtimeData = response.data.content[0];
        console.log("Giờ chuẩn: ", $scope.overtimeData.startTime, $scope.overtimeData.endTime);

        // Kiểm tra xem có dữ liệu nào được trả về trong content không
        if (response.data.content && response.data.content.length > 0) {
          const overtimeData = response.data.content[0]; // Lấy phần tử đầu tiên trong content
          const overtimeDate = overtimeData.overtimeDate; // Giả sử định dạng 'YYYY-MM-DD'

          // Gán startTime và endTime vào $scope.newSchedule
          // Chuyển thời gian UTC sang múi giờ địa phương (GMT+7)
          $scope.newSchedule.startTime = new Date(`${overtimeDate}T${overtimeData.startTime}Z`);
          $scope.newSchedule.endTime = new Date(`${overtimeDate}T${overtimeData.endTime}Z`);

          // Trừ đi 7 giờ từ startTime và endTime
          $scope.newSchedule.startTime.setHours($scope.newSchedule.startTime.getHours() - 7);
          $scope.newSchedule.endTime.setHours($scope.newSchedule.endTime.getHours() - 7);

          // Kiểm tra kết quả
          console.log("Giờ bắt đầu sau khi trừ 7 giờ:", $scope.newSchedule.startTime);
          console.log("Giờ kết thúc sau khi trừ 7 giờ:", $scope.newSchedule.endTime);


          $scope.newSchedule.hourlyRate = overtimeData.hourlyRate;

          // Lấy danh sách employeeID từ overtimerecords
          $scope.selectedEmployeeIds = overtimeData.overtimerecords.map(record => record.employeeID);

          console.log("Danh sách nhân viên có lịch làm thêm theo ngày bắt đầu:", $scope.selectedEmployeeIds);
        } else {
          console.log("Không có dữ liệu làm thêm khớp với ngày bắt đầu");
        }
      })
      .catch(error => {
        console.error('Lỗi khi lấy dữ liệu làm thêm:', error);
      });
  };


  $scope.resetSelection = function () {
    // Xóa danh sách các ID nhân viên đã chọn
    $scope.selectedEmployeeIds = [];
    $scope.selectAll = false; // Reset checkbox "Chọn tất cả"
  };
  $scope.toggleEmployeeSelection = function (employeeId) {
    const index = $scope.selectedEmployeeIds.indexOf(employeeId);
    if (index > -1) {
      // Nếu ID đã có trong mảng, xóa nó
      $scope.selectedEmployeeIds.splice(index, 1);
    } else {
      // Nếu ID chưa có, thêm vào mảng
      $scope.selectedEmployeeIds.push(employeeId);
    }
    console.log("Selected Employee IDs:", $scope.selectedEmployeeIds); // Kiểm tra dữ liệu sau khi chọn/bỏ chọn
  };

  $scope.toggleSelectAll = function () {
    if ($scope.selectAll) {
      // Chọn tất cả nhân viên
      $scope.overtimeEmployeeIds = $scope.employees.map(employee => employee.id);
      $scope.selectedEmployeeIds = angular.copy($scope.overtimeEmployeeIds);
    } else {
      // Bỏ chọn tất cả nhân viên
      $scope.overtimeEmployeeIds = [];
      $scope.selectedEmployeeIds = [];
    }
  };

  $scope.filterEmployees = function () {
    const { scheduleDate, startTime, endTime } = $scope.selectedSchedule;
    console.log($scope.selectedSchedule);

    // Nếu chưa có ngày hoặc giờ, hiển thị tất cả nhân viên
    if (!scheduleDate || !startTime || !endTime) {
      return;
    }
  };


  $scope.init = function () {
    $scope.getEmployees();
    if ($scope.newSchedule) {
      $scope.filterOvertime();
    }
    $scope.getAllOverTime();
  };

  function formatTime(time) {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }


  $scope.addOvertime = () => {
    const newOvertime = {
      overtimeDate: $scope.selectedSchedule.scheduleDate,
      startTime: formatTime($scope.selectedSchedule.startTime),
      endTime: formatTime($scope.selectedSchedule.endTime),
      hourlyRate: $scope.selectedSchedule.hourlyRate,
      employeeIds: $scope.selectedEmployeeIds
    }

    if (newOvertime.endTime <= newOvertime.startTime) {
      showAlert("Lỗi", "Thời gian kết thúc phải sau thời gian bắt đầu.", "error");
      return;
    }

    if (newOvertime.overtimeDate < new Date()) {
      showAlert("Lỗi", "Ngày làm thêm không được là ngày trong quá khứ.", "error");
      return;
    }

    console.log(newOvertime);

    $http.post(`${domain}/api/overtimes`, newOvertime)
      .then(response => {
        showAlert("Thành công", "Tạo lịch thành công thành công", "success");
        $scope.resetSelection();
        $scope.getEmployees();
        $scope.getAllOverTime();
      })
      .catch(error => {
        if (error.data && error.data.message) {
          showAlert("Lỗi", error.data.message, "error");
        } else {
          showAlert("Lỗi", "Đã xảy ra lỗi trong quá trình tạo lịch.", "error");
        }
      });
  }
  $scope.updateOvertime = () => {
    const newOvertime = {
      overtimeDate: $scope.newSchedule.startDate,
      startTime: formatTime($scope.newSchedule.startTime),
      endTime: formatTime($scope.newSchedule.endTime),
      hourlyRate: $scope.newSchedule.hourlyRate,
      employeeIds: $scope.selectedEmployeeIds
    }
    console.log(newOvertime);
    console.log();


    if (newOvertime.endTime <= newOvertime.startTime) {
      showAlert("Lỗi", "Thời gian kết thúc phải sau thời gian bắt đầu.", "error");
      return;
    }

    if (newOvertime.overtimeDate < new Date()) {
      showAlert("Lỗi", "Ngày làm thêm không được là ngày trong quá khứ.", "error");
      return;
    }
    $http.put(`${domain}/api/overtimes/${$scope.overtimeData.id}`, newOvertime)
      .then(response => {
        showAlert("Thành công", "Tạo lịch thành công thành công", "success");
        $scope.resetSelection();
        $scope.getEmployees();
        $scope.getAllOverTime();
      })
      .catch(error => {
        if (error.data && error.data.message) {
          showAlert("Lỗi", error.data.message, "error");
        } else {
          showAlert("Lỗi", "Đã xảy ra lỗi trong quá trình tạo lịch.", "error");
        }
      });
  }

  $scope.deleteOvertime = (item) => {
    Swal.fire({
      title: "Có muốn xóa lịch này không",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Có"
    }).then((result) => {
      if (result.isConfirmed) {
        if (!item.id) {
          showAlert("Lỗi", "Không có ID hợp lệ để xóa", "error");
          return;
        }

        // Gửi yêu cầu DELETE đến API
        $http.delete(`${domain}/api/overtimes/${item.id}`)
          .then(response => {
            Swal.fire({
              title: "Đã xóa",
              text: "Lịch đã được xóa",
              icon: "success"
            });
            $scope.getAllOverTime();
          })
          .catch(error => {
            // Lấy thông báo lỗi chi tiết từ error.response hoặc error.data
            console.error("Lỗi chi tiết khi xóa tăng ca:", error);

            if (error.data) {
              // Trường hợp có thông báo lỗi từ server
              let errorMessage = error.data.message || "Đã xảy ra lỗi không xác định.";
              showAlert("Lỗi", errorMessage, "error");
            } else if (error.statusText) {
              // Trường hợp lỗi từ status code hoặc thông báo lỗi khác
              showAlert("Lỗi", `Lỗi hệ thống: ${error.statusText}`, "error");
            } else {
              // Trường hợp lỗi không rõ ràng
              showAlert("Lỗi", "Đã xảy ra lỗi trong quá trình xóa lịch.", "error");
            }
          });
      }
    });
  };

  function showAlert(title, text, icon) {
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
    });
  }
  $('#nav-tab a').on('shown.bs.tab', function (e) {
    $scope.resetSelection();  // Reset trạng thái khi chuyển tab
    $scope.$apply(); // Đảm bảo AngularJS nhận biết thay đổi
  });

  $scope.init();
});
