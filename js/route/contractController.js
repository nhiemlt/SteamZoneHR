app.controller('contractController', function ($scope, $http) {
  const domain = 'http://localhost:8080';
  const baseUrl = domain + '/api/contracts';

  // Khởi tạo controller
  $scope.init = function () {
    $scope.getAllContracts(); // Lấy danh sách hợp đồng để hiển thị trong modal
    $scope.newContract = {}; // Biến lưu thông tin hợp đồng mới
    $scope.selectedContract = {}; // Biến lưu thông tin hợp đồng khi cập nhật
    $scope.departments = {}; // Lưu thông tin phòng ban
    $scope.positions = {}; // Lưu thông tin chức vụ
  };

  $scope.searchEmployeeQuery;

  // Mở modal thêm hợp đồng
  $scope.openAddContractModal = () => {
    $scope.newContract = {}; // Reset dữ liệu cho hợp đồng mới
    $('#addContractModal').modal('show'); // Hiển thị modal thêm hợp đồng
  };

  // Hàm mở modal cập nhật hợp đồng
  $scope.openUpdateContractModal = function (contract) {
    // Sao chép dữ liệu hợp đồng để tránh thay đổi trực tiếp lên dữ liệu gốc
    $scope.selectedContract = angular.copy(contract);
    console.log($scope.selectedContract)
    $('#updateContractModal').modal('show');
  };

  // Hàm đóng modal cập nhật hợp đồng
  $scope.closeUpdateContractModal = function () {
    // Đóng modal (bằng cách sử dụng Bootstrap modal API hoặc thao tác DOM nếu cần)
    $('#updateContractModal').modal('hide');
  };

  // Hàm đóng modal thêm hợp đồng
  $scope.closeAddContractModal = function () {
    $('#addContractModal').modal('hide');
  };

  // Lấy danh sách hợp đồng
  $scope.getAllContracts = function () {
    $http.get(baseUrl + '/getAll')
      .then(function (response) {
        $scope.contracts = response.data.map(contract => {
          contract.signingDate = new Date(contract.signingDate);
          contract.endDate = new Date(contract.endDate);
          contract.startDate = new Date(contract.startDate);
          return contract;
        });
        console.log(response.data);
      })
      .catch(function (error) {
        console.error("Error fetching contracts:", error);
      });
  };

  // Mở modal thêm hợp đồng
  $scope.openAddContractModal = () => {
    $scope.newContract = {}; // Reset dữ liệu cho hợp đồng mới
    $('#addContractModal').modal('show'); // Hiển thị modal thêm hợp đồng
  };

  // Mở modal cập nhật hợp đồng
  $scope.openUpdateContractModal = (contract) => {
    $scope.selectedContract = angular.copy(contract); // Sao chép dữ liệu hợp đồng để cập nhật
    console.log($scope.selectedContract); // Kiểm tra thông tin hợp đồng đã chọn
    $('#updateContractModal').modal('show'); // Hiển thị modal cập nhật hợp đồng
  };

  // Tạo hợp đồng mới
  $scope.createContract = function (contractData) {
    $http.post(baseUrl + '/postContracts', contractData)
      .then(function (response) {
        console.log("Contract created successfully:", response.data);
        $scope.getAllContracts(); // Refresh danh sách hợp đồng sau khi tạo mới
        $scope.closeAddModal(); // Đóng modal sau khi thêm
      })
      .catch(function (error) {
        console.error("Error creating contract:", error);
        $scope.validationErrors = error.data;
      });
  };

  // Hàm để thêm hợp đồng mới
$scope.addContract = function () {
  // Gọi hàm createContract từ controller để gửi dữ liệu hợp đồng
  $scope.createContract($scope.newContract);
};

  // Cập nhật hợp đồng
  $scope.updateContract = function () {
    $http.put(baseUrl + '/updateContract/' + $scope.selectedContract.id, $scope.selectedContract)
      .then(function (response) {
        console.log("Contract updated successfully:", response.data);
        $scope.getAllContracts(); // Refresh danh sách hợp đồng sau khi cập nhật
        $scope.closeUpdateModal(); // Đóng modal sau khi cập nhật
      })
      .catch(function (error) {
        console.error("Error updating contract:", error);
      });
  };

  // Gửi email thông báo
  $scope.sendEmailToEmployee = function (email) {
    const requestData = { email: email };
    $http.post(baseUrl + '/sendEmail', requestData)
      .then(function (response) {
        console.log(response.data.message);
      })
      .catch(function (error) {
        console.error("Error sending email:", error);
      });
  };

  // Cập nhật mật khẩu thông qua token
  $scope.updatePassword = function (token) {
    $http.get(baseUrl + '/updatePassword', { params: { token: token } })
      .then(function (response) {
        $scope.passwordUpdateMessage = response.data;
      })
      .catch(function (error) {
        console.error("Error updating password:", error);
        if (error.status === 401) {
          $scope.passwordUpdateMessage = "Token has expired";
        }
      });
  };

  // Lấy thống kê điểm danh
  $scope.getAttendanceStatistics = function (startDate, endDate) {
    const requestData = { startDate: startDate, endDate: endDate };
    $http.get(baseUrl + '/getAttendanceStatistics', { data: requestData })
      .then(function (response) {
        $scope.attendanceStatistics = response.data;
      })
      .catch(function (error) {
        console.error("Error fetching attendance statistics:", error);
      });
  };

  // Lấy tổng lương của nhân viên
  $scope.getEmployeeTotalAmount = function () {
    $http.get(baseUrl + '/getEmployeeTotalAmount')
      .then(function (response) {
        $scope.employeeTotalAmount = response.data;
      })
      .catch(function (error) {
        console.error("Error fetching employee total amount:", error);
      });
  };

  // Gọi hàm để lấy danh sách hợp đồng khi controller được khởi tạo
  $scope.getAllContracts();

});
