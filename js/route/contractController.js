app.controller('contractController', function ($scope, $http) {

  const domain = 'http://localhost:8080';
  const baseUrl = domain + '/api/contracts';


  $scope.contracts = [];

  // Dữ liệu mẫu cho nhân viên và người xác nhận
  $scope.employees = [];

  $scope.confirmers = [];

  // Lấy danh sách hợp đồng
  $scope.getAllAccount = function () {
    $http.get(`${domain}/api/employee/getAll`)
      .then(response => {
        $scope.employees = response.data;
        $scope.confirmers = $scope.employees; // Gán sau khi lấy dữ liệu thành công
      })
      .catch(error => console.error('Lỗi khi lấy danh sách nhân viên:', error));
  };

  $scope.getAllAccount();
  $scope.selectedContract = {};
  $scope.newContract = {};
  $scope.searchQuery = ''; // Biến chứa truy vấn tìm kiếm
  $scope.filteredContracts = []; // Danh sách hợp đồng sau khi tìm kiếm
  $scope.noResult = false; // Biến kiểm tra có kết quả tìm kiếm hay không
  $scope.searchEmployeeQuery = ''; // Biến chứa truy vấn tìm kiếm nhân viên
  $scope.filteredEmployees = []; // Danh sách nhân viên sau khi tìm kiếm
  $scope.searchConfirmerQuery = ''; // Biến chứa truy vấn tìm kiếm người xác nhận
  $scope.filteredConfirmers = []; // Danh sách người xác nhận sau khi tìm kiếm



  // Mở modal thêm hợp đồng
  $scope.openAddModal = function () {
    $scope.newContract = {}; // Khởi tạo lại thông tin hợp đồng mới
    $('#addModal').modal('show');
  };

    // Hàm đóng modal thêm hợp đồng
  $scope.closeAddModal = function() {
    $('#addModal').modal('hide'); // Ẩn modal
    $scope.newContract = {}; // Xóa dữ liệu nhập
  };


  // Mở modal cập nhật hợp đồng
  $scope.openUpdateModal = function (contract) {
    $scope.selectedContract = angular.copy(contract); // Sao chép thông tin hợp đồng đã chọn
    console.log($scope.selectedContract) // In thông tin h��p đ��ng đã chọn
    $scope.searchEmployeeQuery = $scope.selectedContract.employeeID.fullName 
    $scope.searchConfirmerQuery = $scope.selectedContract.confirmerID.fullName
    $('#updateModal').modal('show'); // Mở modal cập nhật
  };


  // Toggle trạng thái hợp đồng
  $scope.toggleStatus = function (contract) {
    contract.isActive = !contract.isActive; // Chuyển đổi trạng thái kích hoạt
  };

  // Tìm kiếm hợp đồng
  $scope.searchContracts = function () {
    $scope.filteredContracts = [];
    $scope.noResult = false;

    if (!$scope.searchQuery) return;

    let count = 0;
    $scope.contracts.forEach(function (contract) {
      // Kiểm tra nếu tên nhân viên trong hợp đồng chứa truy vấn tìm kiếm
      if (contract.employeeID.fullName.toUpperCase().includes($scope.searchQuery.toUpperCase()) && count < 5) {
        $scope.filteredContracts.push(contract);
        count++;
      }
    });

    if ($scope.filteredContracts.length === 0) {
      $scope.noResult = true; // Nếu không có kết quả tìm kiếm
    }
  };

  // Hàm xóa kết quả tìm kiếm
  $scope.clearSearchResults = function () {
    $scope.filteredContracts = [];
    $scope.noResult = false;
    $scope.searchQuery = ''; // Reset truy vấn tìm kiếm
  };

  // Tìm kiếm nhân viên
  $scope.searchEmployees = function () {
    $scope.filteredEmployees = [];
    if (!$scope.searchEmployeeQuery || !$scope.employees) return;

    let count = 0;
    $scope.employees.forEach(function (employee) {
      if (employee.fullName.toUpperCase().includes($scope.searchEmployeeQuery.toUpperCase()) && count < 5) {
        $scope.filteredEmployees.push(employee);
        count++;
      }
    });
  };


  // Tìm kiếm người xác nhận
  $scope.searchConfirmers = function () {
    $scope.filteredConfirmers = [];
    if (!$scope.searchConfirmerQuery) return;

    let count = 0;
    $scope.confirmers.forEach(function (confirmer) {
      if (confirmer.fullName.toUpperCase().includes($scope.searchConfirmerQuery.toUpperCase()) && count < 5) {
        $scope.filteredConfirmers.push(confirmer);
        count++;
      }
    });
  };

  // Chọn nhân viên từ danh sách tìm kiếm
  $scope.selectEmployee = function (employee) {
    $scope.newContract.id = employee; // Gán thông tin nhân viên được chọn
    $scope.searchEmployeeQuery = employee.fullName;
    $scope.selectedEmployee = {
      ...$scope.selectedEmployee,
      employee: employee.id
    };
    $scope.filteredEmployees = []; // Xóa danh sách nhân viên tìm kiếm
  };

  // Chọn người xác nhận từ danh sách tìm kiếm
  $scope.selectConfirmer = function (confirmer) {
    $scope.newContract.confirmerID = confirmer; // Gán thông tin người xác nhận được chọn
    $scope.searchConfirmerQuery =  confirmer.fullName; // Reset trường tìm kiếm
    $scope.selectedConfirmer = {
      ...$scope.selectedConfirmer,
      confirmer: confirmer.id
    };
    $scope.filteredConfirmers = []; // Xóa danh sách người xác nhận tìm kiếm
  };


  // Khởi tạo controller
  $scope.init = function () {
    $scope.getAllContracts(); // Lấy danh sách hợp đồng để hiển thị trong modal
    $scope.newContract = {}; // Biến lưu thông tin hợp đồng mới
    $scope.selectedContract = {}; // Biến lưu thông tin hợp đồng khi cập nhật
    $scope.departments = {}; // Lưu thông tin phòng ban
    $scope.positions = {}; // Lưu thông tin chức vụ
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
      })
      .catch(function (error) {
        console.error("Error fetching contracts:", error);
      });
  };

  $scope.addContract = function () {
    const contractData = {
      employeeID: $scope.selectedEmployee.employee || null,  // Lấy ID của nhân viên đã chọn
      confirmerID: $scope.selectedConfirmer.confirmer || null,  // Lấy ID của người xác nhận đã chọn
      agreedSalary: $scope.newContract.agreedSalary,
      signingDate: $scope.newContract.signingDate ? new Date($scope.newContract.signingDate).toISOString() : null,
      startDate: $scope.newContract.startDate ? new Date($scope.newContract.startDate).toISOString() : null,
      endDate: $scope.newContract.endDate ? new Date($scope.newContract.endDate).toISOString() : null
    };
    // Kiểm tra xem tất cả các trường bắt buộc có được điền đầy đủ không
    if (!contractData.employeeID || !contractData.confirmerID || !contractData.agreedSalary || !contractData.startDate || !contractData.endDate) {
      console.error("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }
  
    $http.post(baseUrl + '/postContracts', contractData)
      .then(function (response) {
        Swal.fire({
          title: "Thành công!",
          text: "Hợp đồng đã được thêm.",
          icon: "success",
        });
        $scope.getAllContracts(); // Làm mới danh sách hợp đồng sau khi thêm mới
        $scope.closeAddModal(); // Đóng modal sau khi thêm
        $scope.resetContractForm(); // Xóa dữ liệu trong form sau khi thêm
      })
      .catch(function (error) {
        Swal.fire({
          title: "Thất bại!",
          text: "Thêm hợp đồng không thất bại.",
          icon: "error",
        });
        $scope.validationErrors = error.data;
      });
  };

  $scope.updateContractActiveStatus = function (contract) {
    const contractId = contract.id;
    const isActive = contract.isActive;
  
    // Chỉ giữ lại phần đường dẫn sau baseUrl, tránh lặp api/contracts
    const apiUrl = baseUrl + '/updateActiveContracts/' + contractId;
  
    $http.put(apiUrl, null, {
      params: { active: isActive }
    })
    .then(function (response) {
      Swal.fire({
        title: "Thành công!",
        text: "Hợp đồng đã được cập nhật.",
        icon: "success",
      });
      $scope.getAllContracts();
    })
    .catch(function (error) {
      Swal.fire({
        title: "Thất bại!",
        text: "Cập nhật hợp đồng không thất bại.",
        icon: "error",
      });
    });
  };
  
  // Hàm reset form
  $scope.resetContractForm = function () {
    $scope.newContract = {};
    $scope.selectedEmployee = null;
    $scope.selectedConfirmer = null;
    $scope.selectedEmployee = null;
    $scope.selectedConfirmer = null;
  };

  // Gọi hàm để lấy danh sách hợp đồng khi controller được khởi tạo
  $scope.getAllContracts();

});
