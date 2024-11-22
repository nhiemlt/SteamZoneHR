app.controller('contractController', function ($scope, $http) {

  const domain = 'http://localhost:8080';
  const baseUrl = domain + '/api/contracts';


  $scope.contracts = [];

  // Dữ liệu mẫu cho nhân viên và người xác nhận
  $scope.employees = [];

  // Lấy danh sách nhân viên có phân trang và tìm kiếm
  $scope.getAllAccount = function (searchKeyword = '', page = 0, size = 10) {
    // Gửi yêu cầu tới API với các tham số phân trang và tìm kiếm
    $http.get(`${domain}/api/employees`, {
      params: {
        keyword: searchKeyword,  // Từ khóa tìm kiếm
        page: page,              // Số trang
        size: size               // Số lượng nhân viên trên mỗi trang
      }
    })
      .then(response => {
        $scope.employees = response.data.content; // Lấy dữ liệu nhân viên từ phần `content` trong trang
        $scope.totalEmployees = response.data.totalElements; // Tổng số nhân viên
        $scope.totalPages = response.data.totalPages; // Tổng số trang
      })
      .catch(error => {
        console.error('Lỗi khi lấy danh sách nhân viên:', error);
      });
  };

  $scope.getAllAccount();
  $scope.selectedContract = {};
  $scope.newContract = {};
  $scope.searchQuery = ''; // Biến chứa truy vấn tìm kiếm
  $scope.filteredContracts = []; // Danh sách hợp đồng sau khi tìm kiếm
  $scope.noResult = false; // Biến kiểm tra có kết quả tìm kiếm hay không
  $scope.searchEmployeeQuery = ''; // Biến chứa truy vấn tìm kiếm nhân viên
  $scope.filteredEmployees = []; // Danh sách nhân viên sau khi tìm kiếm

  // Mở modal thêm hợp đồng
  $scope.openAddModal = function () {
    $scope.newContract = {}; // Khởi tạo lại thông tin hợp đồng mới
    $('#addModal').modal('show');
  };

  // Hàm đóng modal thêm hợp đồng
  $scope.closeAddModal = function () {
    $('#addModal').modal('hide'); // Ẩn modal
    $scope.newContract = {}; // Xóa dữ liệu nhập
  };


  // Mở modal cập nhật hợp đồng
  $scope.openUpdateModal = function (contract) {
    $scope.selectedContract = angular.copy(contract); // Sao chép thông tin hợp đồng đã chọn
    console.log($scope.selectedContract); // In thông tin hợp đồng đã chọn

    // Đặt selectedEmployee từ thông tin của selectedContract nếu có
    $scope.selectedEmployee = { employee: $scope.selectedContract.employeeID || null };

    // Hiển thị tên nhân viên trong ô tìm kiếm (nếu có)
    $scope.searchEmployeeQuery = $scope.selectedContract.employeeID ? $scope.selectedContract.employeeID.fullName : '';
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

  // Thiết lập các biến trang và kích thước trang
  $scope.currentPage = 0;
  $scope.pageSize = 10;

  // Hàm gọi API tìm kiếm hợp đồng
  $scope.searchContracts = function () {
    $scope.getAllContracts($scope.keyword, { page: 0, size: 10 }, ['id', 'desc']);
  };

  // Hàm chuyển trang
  $scope.goToPage = function (page) {
    $scope.currentPage = page;
    $scope.searchContracts();
  };

  // Khởi tạo controller
  $scope.init = function () {
    $scope.getAllContracts(); // Lấy danh sách hợp đồng để hiển thị trong modal
    $scope.newContract = {}; // Biến lưu thông tin hợp đồng mới
    $scope.selectedContract = {}; // Biến lưu thông tin hợp đồng khi cập nhật
    $scope.departments = {}; // Lưu thông tin phòng ban
    $scope.positions = {}; // Lưu thông tin chức vụ
  };

  // Hàm lấy danh sách hợp đồng với phân trang, tìm kiếm, và sắp xếp
  $scope.getAllContracts = function (keyword, pageable, sort) {
    let params = {
      keyword: keyword || null,
      page: pageable?.page || 0,
      size: pageable?.size || 10,
      sort: sort || ['id', 'desc']
    };

    $http.get(baseUrl, { params: params })
      .then(function (response) {
        // Gán danh sách hợp đồng từ response
        $scope.contracts = response.data.content.map(contract => {
          contract.signingDate = new Date(contract.signingDate);
          contract.endDate = new Date(contract.endDate);
          contract.startDate = new Date(contract.startDate);
          return contract;
        });
        $scope.totalElements = response.data.totalElements; // Tổng số bản ghi
        $scope.totalPages = response.data.totalPages; // Tổng số trang
      })
      .catch(function (error) {
        console.error("Error fetching contracts:", error);
      });
  };

  // Hàm lấy chi tiết hợp đồng theo ID
  $scope.getContractById = function (contractId) {
    $http.get(baseUrl + '/' + contractId)
      .then(function (response) {
        // Gán dữ liệu chi tiết hợp đồng vào biến $scope.contractDetail
        $scope.contractDetail = response.data;

        // Chuyển đổi các trường ngày thành kiểu Date cho dễ dàng sử dụng
        $scope.contractDetail.signingDate = new Date($scope.contractDetail.signingDate);
        $scope.contractDetail.endDate = new Date($scope.contractDetail.endDate);
        $scope.contractDetail.startDate = new Date($scope.contractDetail.startDate);
      })
      .catch(function (error) {
        console.error("Error fetching contract details:", error);
      });
  };


  //Hàm thêm hợp đồng
  $scope.addContract = function () {
    const contractData = {
      employeeID: $scope.selectedEmployee.employee || null, // Lấy ID của nhân viên đã chọn
      salary: $scope.newContract.agreedSalary, // Mức lương
      signingDate: $scope.newContract.signingDate ? new Date($scope.newContract.signingDate).toISOString() : null, // Ngày ký
      startDate: $scope.newContract.startDate ? new Date($scope.newContract.startDate).toISOString() : null, // Ngày bắt đầu
      endDate: $scope.newContract.endDate ? new Date($scope.newContract.endDate).toISOString() : null // Ngày kết thúc
    };

    // Kiểm tra xem tất cả các trường bắt buộc có được điền đầy đủ không
    if (!contractData.employeeID || !contractData.salary || !contractData.startDate || !contractData.endDate || !contractData.signingDate) {
      Swal.fire({
        title: "Lỗi",
        text: "Vui lòng điền đầy đủ các trường bắt buộc.",
        icon: "error",
      });
      return;
    }

    // Gửi dữ liệu hợp đồng tới backend
    $http.post(baseUrl, contractData)
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
        // Xử lý lỗi trả về từ server (BindingResult)
        if (error.data) {
          let errorMessage = '';
          for (let field in error.data) {
            errorMessage += `${error.data[field]}\n`; // Gộp các lỗi lại
          }
          Swal.fire({
            title: "Thất bại!",
            text: `Có lỗi xảy ra:\n${errorMessage}`,
            icon: "error",
          });
        } else {
          Swal.fire({
            title: "Thất bại!",
            text: "Đã xảy ra lỗi khi thêm hợp đồng.",
            icon: "error",
          });
        }
        $scope.validationErrors = error.data; // Lưu lại lỗi để xử lý sau (nếu cần)
      });
  };


  // Hàm cập nhật trạng thái hợp đồng
  $scope.updateContractActiveStatus = function (contract) {
    const contractId = contract.id;
    const apiUrl = `${baseUrl}/${contractId}/toggle-status`; // URL với contractId và endpoint toggle-status

    $http.put(apiUrl)
      .then(function (response) {
        Swal.fire({
          title: "Thành công!",
          text: "Trạng thái hợp đồng đã được cập nhật.",
          icon: "success",
        });
        $scope.getAllContracts(); // Làm mới danh sách hợp đồng sau khi cập nhật
      })
      .catch(function (error) {
        if (error.status === 404) {
          Swal.fire({
            title: "Thất bại!",
            text: error.data || `Không tìm thấy hợp đồng với ID: ${contractId}`,
            icon: "error",
          });
        } else {
          Swal.fire({
            title: "Thất bại!",
            text: "Cập nhật trạng thái hợp đồng không thành công.",
            icon: "error",
          });
        }
      });
  };

  // Hàm cập nhật hợp đồng
  $scope.updateContract = function () {
    const contractId = $scope.selectedContract.id;

    // Chuẩn bị dữ liệu để cập nhật hợp đồng
    const contractData = {
      employeeID: $scope.selectedEmployee?.employee.id,
      salary: $scope.selectedContract.salary ? $scope.selectedContract.salary : 0 ,
      signingDate: $scope.selectedContract.signingDate ? new Date($scope.selectedContract.signingDate).toISOString() : null,
      startDate: $scope.selectedContract.startDate ? new Date($scope.selectedContract.startDate).toISOString() : null,
      endDate: $scope.selectedContract.endDate ? new Date($scope.selectedContract.endDate).toISOString() : null
    };

    // Kiểm tra lỗi đầu vào
    if (!contractData.employeeID || contractData.salary<0 || contractData.salary==null  || !contractData.startDate || !contractData.endDate || !contractData.signingDate) {
      console.log(contractData.salary)
      console.error("Vui lòng điền đầy đủ các trường bắt buộc.");
      Swal.fire({
        title: "Lỗi",
        text: "Vui lòng điền đầy đủ các trường bắt buộc.",
        icon: "error",
      });
      return;
    }

    // Kiểm tra ngày kết thúc có lớn hơn ngày bắt đầu không
    if (new Date(contractData.startDate) >= new Date(contractData.endDate)) {
      console.error("Ngày kết thúc phải lớn hơn ngày bắt đầu.");
      Swal.fire({
        title: "Lỗi",
        text: "Ngày kết thúc phải lớn hơn ngày bắt đầu.",
        icon: "error",
      });
      return;
    }

    // Gửi yêu cầu PUT để cập nhật hợp đồng
    const apiUrl = `${baseUrl}/${contractId}`;
    $http.put(apiUrl, contractData)
      .then(function (response) {
        Swal.fire({
          title: "Thành công!",
          text: "Hợp đồng đã được cập nhật.",
          icon: "success",
        });
        $scope.getAllContracts(); // Làm mới danh sách hợp đồng
        $scope.resetContractForm();
        $('#updateModal').modal('hide'); // Đóng modal cập nhật
      })
      .catch(function (error) {
        if (error.status === 404) {
          Swal.fire({
            title: "Thất bại!",
            text: error.data || `Không tìm thấy hợp đồng với ID: ${contractId}`,
            icon: "error",
          });
        } else {
          Swal.fire({
            title: "Thất bại!",
            text: "Cập nhật hợp đồng không thành công.",
            icon: "error",
          });
          console.error(error); // Log chi tiết lỗi để kiểm tra
        }
      });
  };

  // Hàm xóa hợp đồng
  $scope.deleteContract = function (contractId) {
    const apiUrl = `${baseUrl}/${contractId}`;

    Swal.fire({
      title: "Xác nhận xóa",
      text: "Bạn có chắc chắn muốn xóa hợp đồng này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy"
    }).then((result) => {
      if (result.isConfirmed) {
        $http.delete(apiUrl)
          .then(function (response) {
            Swal.fire("Đã xóa!", "Hợp đồng đã được xóa thành công.", "success");
            $scope.getAllContracts(); // Cập nhật lại danh sách hợp đồng sau khi xóa
          })
          .catch(function (error) {
            Swal.fire("Thất bại!", "Xóa hợp đồng không thành công.", "error");
          });
      }
    });
  };

  // Hàm reset form
  $scope.resetContractForm = function () {
    $scope.newContract = {};
    $scope.selectEmployee = null;
    $scope.selectedEmployee = null;
  };

  $scope.getAllContracts();

});
