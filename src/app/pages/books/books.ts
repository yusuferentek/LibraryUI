import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BookRequest {
  title: string;
  authorId: number | null;
  categoryId: number | null;
}

interface BookUpdateRequest extends BookRequest {
  id: number;
}

@Component({
  selector: 'app-books',
  imports: [DatePipe, FormsModule],
  templateUrl: './books.html',
  styleUrl: './books.css',
})
export class Books implements OnInit {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://localhost:7121/api/book';

  protected books = signal<any[]>([]);
  protected isModalOpen = signal(false);
  protected isLoading = signal(false);
  protected isEditMode = signal(false);
  protected isDeleteModalOpen = signal(false);
  protected deletingBook = signal<any | null>(null);

  private editingBookId: number | null = null;

  protected formData: BookRequest = {
    title: '',
    authorId: null,
    categoryId: null,
  };

  ngOnInit() {
    this.loadBooks();
  }

  private loadBooks() {
    this.http.get<any>(this.apiUrl).subscribe({
      next: (response) => {
        this.books.set(response?.data ?? []);
      },
      error: (error) => {
        console.error('Kitaplar yüklenirken hata:', error);
      },
    });
  }

  protected openModal() {
    this.resetForm();
    this.isEditMode.set(false);
    this.editingBookId = null;
    this.isModalOpen.set(true);
  }

  protected openEditModal(book: any) {
    this.isEditMode.set(true);
    this.editingBookId = book.id;
    this.formData = {
      title: book.title,
      authorId: book.authorId,
      categoryId: book.categoryId,
    };
    this.isModalOpen.set(true);
  }

  protected closeModal() {
    this.isModalOpen.set(false);
    this.resetForm();
    this.isEditMode.set(false);
    this.editingBookId = null;
  }

  protected resetForm() {
    this.formData = {
      title: '',
      authorId: null,
      categoryId: null,
    };
  }

  protected saveBook() {
    if (this.isEditMode()) {
      this.updateBook();
    } else {
      this.createBook();
    }
  }

  private createBook() {
    if (!this.formData.title || !this.formData.authorId || !this.formData.categoryId) {
      return;
    }

    this.isLoading.set(true);

    const request: BookRequest = {
      title: this.formData.title,
      authorId: this.formData.authorId,
      categoryId: this.formData.categoryId,
    };

    this.http.post<any>(this.apiUrl, request).subscribe({
      next: () => {
        this.loadBooks();
        this.closeModal();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Kitap eklenirken hata:', error);
        this.isLoading.set(false);
      },
    });
  }

  private updateBook() {
    if (!this.editingBookId || !this.formData.title || !this.formData.authorId || !this.formData.categoryId) {
      return;
    }

    this.isLoading.set(true);

    const request: BookUpdateRequest = {
      id: this.editingBookId,
      title: this.formData.title,
      authorId: this.formData.authorId,
      categoryId: this.formData.categoryId,
    };

    this.http.put<any>(`${this.apiUrl}/${this.editingBookId}`, request).subscribe({
      next: () => {
        this.loadBooks();
        this.closeModal();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Kitap güncellenirken hata:', error);
        this.isLoading.set(false);
      },
    });
  }

  protected openDeleteModal(book: any) {
    this.deletingBook.set(book);
    this.isDeleteModalOpen.set(true);
  }

  protected closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.deletingBook.set(null);
  }

  protected deleteBook() {
    const book = this.deletingBook();
    if (!book) return;

    this.isLoading.set(true);

    this.http.delete<any>(`${this.apiUrl}/${book.id}`).subscribe({
      next: () => {
        this.loadBooks();
        this.closeDeleteModal();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Kitap silinirken hata:', error);
        this.isLoading.set(false);
      },
    });
  }
}
