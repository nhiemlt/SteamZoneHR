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
        // Kiểm tra xem có dữ liệu nào được trả về trong content không
        if (response.data.content && response.data.content.length > 0) {
          const overtimeData = response.data.content[0]; // Lấy phần tử đầu tiên trong content

          // Gán startTime và endTime vào $scope.newSchedule
          $scope.newSchedule.startTime = new Date('1970-01-01T' + overtimeData.startTime + 'Z'); // Định dạng thành HH:mm
          $scope.newSchedule.endTime = new Date('1970-01-01T' + overtimeData.endTime + 'Z');
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
    // $scope.getOvertime($scope.newSchedule.startDate, $scope.newSchedule.andDate);
  };

  function formatTime(time) {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  $scope.addOvertime = () => {
    const newOvertime = {
      overtimeDate: $scope.selectedSchedule.scheduleDate.toISOString(),
      startTime: formatTime($scope.selectedSchedule.startTime),
      endTime: formatTime($scope.selectedSchedule.endTime),
      hourlyRate: $scope.selectedSchedule.hourlyRate,
      employeeIds: $scope.selectedEmployeeIds
    }
    console.log(newOvertime);
    
    if (newOvertime.endTime <= newOvertime.startTime) {
      showAlert("Lỗi", "Thời gian kết thúc phải sau thời gian bắt đầu.", "error");
      return;
    }

    if (newOvertime.overtimeDate < new Date()) {
      showAlert("Lỗi", "Ngày làm thêm không được là ngày trong quá khứ.", "error");
      return;
    }
    $http.post(`${domain}/api/overtimes`, newOvertime)
      .then(response => {
        showAlert("Thành công", "Tạo lịch thành công thành công", "success");
        $scope.resetSelection();
        $scope.getEmployees();
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
      overtimeDate: $scope.newSchedule.startDate.toISOString(),
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
      })
      .catch(error => {
        if (error.data && error.data.message) {
          showAlert("Lỗi", error.data.message, "error");
        } else {
          showAlert("Lỗi", "Đã xảy ra lỗi trong quá trình tạo lịch.", "error");
        }
      });
  }
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
