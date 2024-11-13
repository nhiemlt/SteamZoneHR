app.controller("positionController", function ($scope, $http) {
  const baseUrl = "http://localhost:8080/api/departments";
  const baseURLP = "http://localhost:8080/api/positions";
  $scope.departments = [];
  $scope.currentDepartmentPage = 1;
  $scope.departmentItemsPerPage = 10;
  $scope.newDepartment = { departmentName: "", isActive: true };
  $scope.selectedDepartment = {};
  $scope.getDepartments = function () {
    const params = {
      departmentName: $scope.searchDepartmentName || "",
      sort: "departmentName",
      direction: "ASC",
    };

    $http
      .get(baseUrl, { params: params })
      .then((response) => {
        $scope.departments = response.data.slice(
          ($scope.currentDepartmentPage - 1) * $scope.departmentItemsPerPage,
          $scope.currentDepartmentPage * $scope.departmentItemsPerPage
        );
        $scope.totalDepartmentPages = Math.ceil(
          response.data.length / $scope.departmentItemsPerPage
        );
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  };
  $scope.getTotalDepartmentPages = function () {
    // Calculate the total number of pages based on the number of departments and items per page
    return Math.ceil($scope.departments.length / $scope.departmentItemsPerPage);
  };

  // Function to get the paginated departments
  $scope.getPaginatedDepartments = function () {
    var start =
      ($scope.currentDepartmentPage - 1) * $scope.departmentItemsPerPage;
    var end = start + $scope.departmentItemsPerPage;
    return $scope.departments.slice(start, end); // Return the sliced array for the current page
  };

  // Function to change the current page
  $scope.changeDepartmentPage = function (page) {
    if (page >= 1 && page <= $scope.getTotalDepartmentPages()) {
      $scope.currentDepartmentPage = page;
    }
  };
  $scope.openUpdateModal = function (department) {
    $scope.selectedDepartment = angular.copy(department);
    $("#updateDepartmentModal").modal("show");
  };
  $scope.addDepartment = function () {
    if (!$scope.newDepartment.departmentName) {
      Swal.fire("Lỗi", "Tên phòng ban không được để trống.", "error");
      return;
    }
    if (
      !$scope.newDepartment.departmentName ||
      $scope.newDepartment.departmentName.length < 3
    ) {
      Swal.fire("Lỗi", "Tên phòng ban phải có ít nhất 3 ký tự.", "error");
      return;
    }

    $http
      .post(baseUrl, $scope.newDepartment)
      .then((response) => {
        Swal.fire("Thành công", "Thêm phòng ban thành công.", "success");
        $scope.newDepartment = { departmentName: "", isActive: true };
        $scope.getDepartments();
      })
      .catch((error) => {
        Swal.fire("Lỗi", "Không thể thêm phòng ban.", "error");
      });
  };
  $scope.updateDepartment = function (id) {
    if (!$scope.selectedDepartment.departmentName) {
      Swal.fire("Lỗi", "Tên phòng ban không được để trống.", "error");
      return;
    }
    if (
      !$scope.selectedDepartment.departmentName ||
      $scope.selectedDepartment.departmentName.length < 3
    ) {
      Swal.fire("Lỗi", "Tên phòng ban phải có ít nhất 3 ký tự.", "error");
      return;
    }
    $http
      .put(`${baseUrl}/${id}`, $scope.selectedDepartment)
      .then((response) => {
        Swal.fire("Thành công", "Cập nhật phòng ban thành công.", "success");
        $scope.getDepartments();
        $scope.getActiveDepartments();
        $("#updateDepartmentModal").modal("hide");
        $scope.getDepartments();
      })
      .catch((error) => {
        Swal.fire("Lỗi", "Không thể cập nhật phòng ban.", "error");
      });
  };

  // Hàm cập nhật trạng thái `isActive` của phòng ban
  $scope.updateDepartmentStatus = function (department) {
    const updatedDepartment = {
      departmentName: department.departmentName,
      isActive: department.isActive,
    };

    $http
      .put(`${baseUrl}/${department.id}/toggle-status`, updatedDepartment)
      .then((response) => {
        Swal.fire(
          "Thành công",
          "Trạng thái phòng ban đã được cập nhật.",
          "success"
        );
        $scope.getDepartments();
        $scope.getActiveDepartments();
      })
      .catch((error) => {
        Swal.fire("Lỗi", "Không thể cập nhật trạng thái phòng ban.", "error");
      });
  };
  $scope.getDepartments = function () {
    $http.get(baseUrl).then(function (response) {
      $scope.departments = response.data;
    });
  };

  // Cập nhật lại danh sách sau khi xóa
  $scope.deleteDepartment = function (id) {
    // Hiển thị hộp thoại xác nhận trước khi xóa
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa phòng ban này?",
      text: "Phòng ban sẽ bị xóa vĩnh viễn.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        // Gửi yêu cầu DELETE đến backend
        $http
          .delete(`${baseUrl}/${id}`)
          .then((response) => {
            // Nếu thành công, hiển thị thông báo thành công
            if (response.data.status === "success") {
              Swal.fire("Thành công", response.data.message, "success");

              // Cập nhật lại danh sách phòng ban
              $scope.getDepartments();
            }
          })
          .catch((error) => {
            let errorMessage = "Không thể xóa phòng ban.";

            // Kiểm tra và hiển thị lỗi dựa trên mã trạng thái HTTP
            if (error.status === 409) {
              // Nếu lỗi là do phòng ban đang được tham chiếu
              errorMessage =
                error.data.message ||
                "Không thể xóa phòng ban này vì có chức vụ đang sử dụng.";
            } else if (error.status === 404) {
              // Nếu không tìm thấy phòng ban
              errorMessage =
                error.data.message || "Không tìm thấy phòng ban với id: " + id;
            } else if (error.status === 500) {
              // Lỗi server
              errorMessage =
                error.data.message ||
                "Có lỗi xảy ra trong quá trình xóa phòng ban.";
            }
            Swal.fire("Lỗi", errorMessage, "error");
          });
      }
    });
  };

  //  chức vụ
  $scope.getActiveDepartments = function () {
    $http
      .get(baseUrl + "/active")
      .then(function (response) {
        $scope.activeDepartments = response.data;
        console.log($scope.activeDepartments);
      })
      .catch(function (error) {
        Swal.fire("Lỗi", "Không thể lấy danh sách phòng ban.", "error");
      });
  };
  $scope.getDepartments();
  $scope.getActiveDepartments();
});
