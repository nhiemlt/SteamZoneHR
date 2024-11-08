angular.module("app").service("PositionService", function ($http) {
  // Sử dụng endpoint tương đối
  const BASE_URL = "http://localhost:8080";

  this.getAllDepartments = function () {
    return $http.get(BASE_URL + "/api/department/getAll");
  };

  this.getAllPositions = function () {
    return $http.get(BASE_URL + "/api/PositionDepartment/getAll");
  };

  this.addDepartment = function (department) {
    return $http.post(`${BASE_URL}/api/department/Add`, department);
  };

  this.updateDepartment = function (id, department) {
    return $http.put(`${BASE_URL}/api/department/update/${id}`, department);
  };

  this.addPosition = function (position) {
    return $http.post(
      BASE_URL + "/api/PositionDepartment/add-position-department",
      position
    );
  };

  this.updatePosition = function (position) {
    return $http.put(`${BASE_URL}/api/PositionDepartment/update/66`, position);
  };
  // xoá chức vụ
  this.deletePosition = function (id) {
    return $http.delete(`${BASE_URL}/api/PositionDepartment/delete/${id}`);
  };
});

angular
  .module("app")
  .controller("positionController", function ($scope, PositionService) {
    // tải dữ liệu lên client và phân trang
    $scope.loadDepartments = function () {
      PositionService.getAllDepartments()
        .then((response) => {
          $scope.departments = response.data;
        })
        .catch((error) => {
          console.error("Error fetching departments:", error);
        });
    };

    $scope.getPaginatedDepartments = function () {
      const start =
        ($scope.currentDepartmentPage - 1) * $scope.departmentItemsPerPage;
      return $scope.departments.slice(
        start,
        start + $scope.departmentItemsPerPage
      );
    };

    $scope.getTotalDepartmentPages = function () {
      return Math.ceil(
        $scope.departments.length / $scope.departmentItemsPerPage
      );
    };

    $scope.changeDepartmentPage = function (page) {
      if (page > 0 && page <= $scope.getTotalDepartmentPages()) {
        $scope.currentDepartmentPage = page;
      }
    };
    // tải dữ liệu chức vụ lên client và phân trang
    $scope.loadPositions = function () {
      PositionService.getAllPositions()
        .then((response) => {
          // Sort positions alphabetically by the positionName field
          $scope.positions = response.data.sort((a, b) => {
            const nameA = (
              a.positionID && a.positionID.positionName
                ? a.positionID.positionName.trim().toLowerCase()
                : ""
            ).toLowerCase();
            const nameB = (
              b.positionID && b.positionID.positionName
                ? b.positionID.positionName.trim().toLowerCase()
                : ""
            ).toLowerCase();

            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0;
          });
        })
        .catch((error) => {
          console.error("Error fetching positions:", error);
        });
    };
    $scope.init = () => {
      $scope.positions = [];
      $scope.departments = [];
      $scope.newDepartment = {};
      $scope.selectedDepartment = null;
      $scope.newPosition = { positionName: "", departmentID: [] };
      $scope.totalItems = 0;
      $scope.currentDepartmentPage = 1;
      $scope.departmentItemsPerPage = 5;
      $scope.currentPositionPage = 1;
      $scope.positionItemsPerPage = 5;
      $scope.selectedPosition = {};
      $scope.selectedDepartment = {};
      $scope.loadDepartments();
      $scope.loadPositions();
    };
    $scope.getPaginatedPositions = function () {
      const start =
        ($scope.currentPositionPage - 1) * $scope.positionItemsPerPage;
      return $scope.positions.slice(start, start + $scope.positionItemsPerPage);
    };

    $scope.getTotalPositionPages = function () {
      return Math.ceil($scope.positions.length / $scope.positionItemsPerPage);
    };

    $scope.changePositionPage = function (page) {
      if (page > 0 && page <= $scope.getTotalPositionPages()) {
        $scope.currentPositionPage = page;
      }
    };

    // Thêm phòng ban
    $scope.addDepartment = function () {
      PositionService.addDepartment($scope.newDepartment)
        .then(function (response) {
          $scope.departments.push(response.data);
          $scope.newDepartment = {}; // Reset form
          Swal.fire({
            title: "Thành công!",
            text: "Phòng ban đã được thêm.",
            icon: "success",
          });
        })
        .catch(function (error) {
          console.error("Error adding department:", error);
          Swal.fire({
            title: "Lỗi!",
            text: "Đã xảy ra lỗi khi thêm phòng ban. Vui lòng thử lại.",
            icon: "error",
          });
        });
    };

    // Cập nhật trạng thái phòng ban
    $scope.updateDepartmentStatus = function (department) {
      const originalState = department.isActive;
      Swal.fire({
        title: "Bạn có chắc chắn muốn cập nhật trạng thái không?",
        text: "Bạn sẽ không thể khôi phục lại điều này!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Có, cập nhật!",
        cancelButtonText: "Không, huỷ bỏ!",
      }).then((result) => {
        if (result.isConfirmed) {
          PositionService.updateDepartment(department.id, department)
            .then(function (response) {
              const index = $scope.departments.findIndex(
                (dept) => dept.id === response.data.id
              );
              if (index !== -1) {
                $scope.departments[index] = response.data;
              }
              Swal.fire({
                title: "Thành công!",
                text: "Trạng thái phòng ban đã được cập nhật.",
                icon: "success",
              });
            })
            .catch(function (error) {
              console.error("Error updating department status:", error);
              Swal.fire({
                title: "Lỗi!",
                text: "Đã xảy ra lỗi khi cập nhật trạng thái phòng ban. Vui lòng thử lại.",
                icon: "error",
              });
            });
        } else {
          console.log("Hello");
          department.isActive = originalState;
        }
      });
    };

    // mở modal phòng ban
    $scope.openUpdateModal = function (department) {
      $scope.selectedDepartment = angular.copy(department); // Lưu phòng ban đã chọn
      $("#updateDepartmentModal").modal("show"); // Mở modal
    };
    // Cập nhật phòng ban
    $scope.updateDepartment = function (departmentId) {
      if ($scope.selectedDepartment) {
        PositionService.updateDepartment(
          departmentId,
          $scope.selectedDepartment
        )
          .then(function (response) {
            const index = $scope.departments.findIndex(
              (dept) => dept.id === response.data.id
            );
            if (index !== -1) {
              $scope.departments[index] = response.data; // Update the list
            }
            $scope.selectedDepartment = null; // Reset selection
            $("#updateDepartmentModal").modal("hide");
            Swal.fire({
              title: "Thành công!",
              text: "Phòng ban đã được cập nhật.",
              icon: "success",
            });
          })
          .catch(function (error) {
            console.error("Error updating department:", error);
            Swal.fire({
              title: "Lỗi!",
              text: "Đã xảy ra lỗi khi cập nhật phòng ban. Vui lòng thử lại.",
              icon: "error",
            });
          });
      }
    };

    // Thêm chức vụ
    $scope.addPosition = function () {
      if (
        !$scope.newPosition.positionName ||
        $scope.newPosition.positionName.trim() === ""
      ) {
        Swal.fire("Lỗi!", "Vui lòng nhập tên chức vụ.", "error");
        return;
      }

      // Kiểm tra nếu không có phòng ban nào được chọn
      const selectedDepartmentIds = $scope.departments
        .filter((department) => department.selected)
        .map((department) => department.id);

      if (selectedDepartmentIds.length === 0) {
        Swal.fire("Lỗi!", "Vui lòng chọn ít nhất một phòng ban.", "error");
        return;
      }

      const positionToAdd = {
        departmentID: selectedDepartmentIds,
        positionName: $scope.newPosition.positionName,
      };

      PositionService.addPosition(positionToAdd)
        .then(function (response) {
          $scope.positions = response.data;
          $scope.loadPositions();
          $scope.newPosition = {};
          Swal.fire("Thành công!", "Chức vụ đã được thêm.", "success");
        })
        .catch(function (error) {
          console.error("Error adding position:", error);
          Swal.fire(
            "Lỗi!",
            "Đã xảy ra lỗi khi thêm chức vụ. Vui lòng thử lại.",
            "error"
          );
        });
    };

    $scope.editPosition = function (position) {
      $scope.selectedPosition = angular.copy(position);
      console.log("Selected Position ID:", $scope.selectedPosition);
      $("#updatePositionModal").modal("show");
    };
    $scope.updatePosition = function () {
      let positionData = {
        positionName: $scope.selectedPosition.positionName,
        departmentID: $scope.selectedPosition.departmentID,
      };

      PositionService.updatePosition($scope.selectedPosition.id, positionData)
        .then(function () {
          PositionService.getPositions().then(function (response) {
            $scope.positions = response.data;
            $("#updatePositionModal").modal("hide");
          });
        })
        .catch(function (error) {
          console.error("Error updating position:", error);
        });
    };

    //  xoá chức vụ
    $scope.deletePosition = function (id) {
      Swal.fire({
        title: "Bạn muốn xóa chức vụ này?",
        text: "Bạn sẽ không thể khôi phục lại điều này!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Vâng, xóa nó!",
      }).then((result) => {
        if (result.isConfirmed) {
          // Gọi API xóa chức vụ
          PositionService.deletePosition(id)
            .then(function () {
              // Cập nhật lại danh sách vị trí
              $scope.positions = $scope.positions.filter(
                (position) => position.id !== id
              );
              Swal.fire({
                title: "Đã xóa!",
                text: "Chức vụ đã được xóa.",
                icon: "success",
              });
            })
            .catch(function (error) {
              console.error("Có nhân viên trong phòng ban này:", error);
              Swal.fire({
                title: "Lỗi!",
                text: "Không thể xoá.  Có nhân viên trong phòng ban này.",
                icon: "error",
              });
            });
        }
      });
    };
    // Khởi tạo dữ liệu

    $scope.init();
  });
